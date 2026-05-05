import React, { useState } from 'react';
import Canvas from './Canvas';
import './App.css';

interface Prediction {
  prediction: number;
  confidence: number;
  probabilities: number[];
}

function App() {
  const [imageData, setImageData] = useState<string>('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!imageData) {
      alert('Please draw a digit first!');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data: Prediction = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Handwritten Digit Recognition</h1>
        <p>Draw a digit (0-9) on the canvas below</p>
      </header>

      <main>
        <div className="container">
          <Canvas onDraw={setImageData} />
          
          <div className="controls">
            <button 
              onClick={handlePredict} 
              disabled={loading || !imageData}
              className="predict-btn"
            >
              {loading ? 'Analyzing...' : 'Recognize Digit'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {prediction && (
            <div className="result-card">
              <h2>Result: <span className="digit">{prediction.prediction}</span></h2>
              <p>Confidence: {(prediction.confidence * 100).toFixed(2)}%</p>
              
              <div className="probability-chart">
                {prediction.probabilities.map((prob, index) => (
                  <div key={index} className="prob-row">
                    <span className="label">{index}:</span>
                    <div className="bar-bg">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                    <span className="value">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
