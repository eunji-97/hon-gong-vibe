import React from 'react';
import './ProgressBar.css';

interface Props {
  current: number;
  total: number;
}

const ProgressBar: React.FC<Props> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      <span className="progress-text">{current} / {total}</span>
    </div>
  );
};

export default ProgressBar;
