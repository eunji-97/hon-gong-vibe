import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import './ResultPage.css';

const ResultPage: React.FC = () => {
  const { state, resetQuiz, addToLeaderboard } = useQuiz();
  const navigate = useNavigate();
  const [displayScore, setDisplayScore] = useState(0);

  const totalQuestions = state.currentQuestions.length;
  const correctCount = state.answers.filter(a => a).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (state.currentQuestions.length === 0) {
      navigate('/');
      return;
    }

    const duration = 1000;
    const steps = 20;
    const stepValue = state.score / steps;
    const intervalTime = duration / steps;

    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= state.score) {
        setDisplayScore(state.score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [state.score, state.currentQuestions.length, navigate]);

  const handleSaveAndLeaderboard = () => {
    addToLeaderboard({
      nickname: state.nickname,
      score: state.score,
      accuracy: accuracy
    });
    navigate('/leaderboard');
  };

  const handleRestart = () => {
    resetQuiz();
    navigate('/category');
  };

  return (
    <div className="result-page">
      <div className="result-card">
        <h1>축하합니다!</h1>
        <p className="nickname-text">{state.nickname}님의 점수</p>
        
        <div className="score-display">
          <span className="score-number">{displayScore}</span>
          <span className="score-unit">점</span>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">정답률</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">맞힌 문제</span>
            <span className="stat-value">{correctCount} / {totalQuestions}</span>
          </div>
        </div>

        <div className="achievement-chart">
          <h3>성취도 분석</h3>
          <div className="chart-container">
            <div className="chart-bar-group">
              <div className="chart-label">정답</div>
              <div className="chart-track">
                <div className="chart-fill positive" style={{ width: `${accuracy}%` }}></div>
              </div>
            </div>
            <div className="chart-bar-group">
              <div className="chart-label">오답</div>
              <div className="chart-track">
                <div className="chart-fill negative" style={{ width: `${100 - accuracy}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="result-buttons">
          <button className="btn-save" onClick={handleSaveAndLeaderboard}>
            순위 저장 및 리더보드
          </button>
          <button className="btn-retry" onClick={handleRestart}>
            다시 도전
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
