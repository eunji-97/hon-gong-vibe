import React, { useEffect, useState } from 'react';
import './Timer.css';

interface Props {
  initialSeconds: number;
  onTimeUp: () => void;
  isActive: boolean;
}

const Timer: React.FC<Props> = ({ initialSeconds, onTimeUp, isActive }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    let interval: number;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      onTimeUp();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, onTimeUp]);

  const getColor = () => {
    if (seconds <= 5) return '#EF4444'; // Red
    if (seconds <= 10) return '#F59E0B'; // Orange
    return '#3B82F6'; // Blue
  };

  const percentage = (seconds / initialSeconds) * 100;

  return (
    <div className="timer-container">
      <div 
        className="timer-circle" 
        style={{ 
          background: `conic-gradient(${getColor()} ${percentage}%, #e2e8f0 0)`
        }}
      >
        <div className="timer-inner">
          <span className="timer-seconds" style={{ color: getColor() }}>{seconds}</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;
