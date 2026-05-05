# Handwritten Digit Recognition Project

This project provides a web-based application for recognizing handwritten digits (0-9) using a machine learning model.

## Project Overview
- **Purpose**: Allow users to draw digits on a canvas and get real-time recognition results.
- **Frontend**: Built with **React** and **TypeScript**, using **Vite** for development. It features a responsive HTML5 Canvas for drawing.
- **Backend**: Built with **FastAPI** (Python). It uses **PyTorch** for the machine learning model (a Convolutional Neural Network) trained on the **MNIST dataset**.
- **Architecture**: The frontend sends the canvas drawing as a base64 encoded PNG to the backend `/predict` endpoint. The backend processes the image (resizing to 28x28, grayscale, normalization) and returns the predicted digit and confidence scores.

## Main Technologies
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: FastAPI, PyTorch, PIL (Pillow), NumPy.
- **ML Model**: Convolutional Neural Network (CNN) defined in `backend/model.py`.

## Building and Running

### Backend
1.  Navigate to the `backend` directory.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    python3 main.py
    ```
    *Note: On first run, the server will automatically download the MNIST dataset and train the model (~1-2 mins).*

### Frontend
1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open the application at `http://localhost:5173`.

## Development Conventions
- **Language**: All code, comments, and documentation must be in **English**.
- **File Headers**: Every new file created must include a comment at the top indicating the date and time of creation (e.g., `// Created on: 2026-05-05 14:00`).
- **Styling**: A modern dark-theme UI is used for the frontend.
- **Image Preprocessing**: The backend converts input images to 28x28 grayscale tensors and normalizes them using MNIST statistics (mean=0.1307, std=0.3081).
- **CORS**: The backend is configured to allow requests from any origin for ease of local development.
