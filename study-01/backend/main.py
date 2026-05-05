import os
import base64
import io
import torch
import torch.optim as optim
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageOps
import numpy as np
from torchvision import datasets, transforms
from model import get_model

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "digit_model.pth"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load or Train model
model = get_model().to(device)

def train_model():
    print("Training model on MNIST dataset...")
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])
    train_loader = torch.utils.data.DataLoader(
        datasets.MNIST('data', train=True, download=True, transform=transform),
        batch_size=64, shuffle=True)
    
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = torch.nn.CrossEntropyLoss()
    
    model.train()
    # Train for 1 epoch for quick setup
    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        if batch_idx % 100 == 0:
            print(f"Batch {batch_idx}: Loss {loss.item():.4f}")
            
    torch.save(model.state_dict(), MODEL_PATH)
    print("Model trained and saved.")

if os.path.exists(MODEL_PATH):
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    print("Model loaded from disk.")
else:
    train_model()
    model.eval()

class ImageRequest(BaseModel):
    image: str # base64 string

@app.post("/predict")
async def predict(request: ImageRequest):
    try:
        # Decode base64 image
        header, encoded = request.image.split(",", 1)
        image_data = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(image_data))
        
        # Preprocess: Convert to grayscale, invert (if background is white), resize to 28x28
        image = image.convert('L')
        # Assuming user draws white on black. If black on white, use ImageOps.invert(image)
        # We'll detect the background color or just resize and normalize.
        # MNIST is white digits on black background.
        image = image.resize((28, 28), Image.Resampling.LANCZOS)
        
        # Convert to tensor
        img_array = np.array(image).astype(np.float32) / 255.0
        # MNIST normalization values
        img_array = (img_array - 0.1307) / 0.3081
        img_tensor = torch.from_numpy(img_array).unsqueeze(0).unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model(img_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence, prediction = torch.max(probabilities, 1)
            
        return {
            "prediction": int(prediction.item()),
            "confidence": float(confidence.item()),
            "probabilities": probabilities.tolist()[0]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
