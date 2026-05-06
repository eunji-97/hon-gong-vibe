import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const emojis = ['🏛️', '🔬', '🌍', '🎨', '📜', '🧬', '🗺️', '🎭'];

  return (
    <div className="home-page">
      <div className="floating-emojis">
        {emojis.map((emoji, index) => (
          <div
            key={index}
            className="floating-emoji"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 20 + 20}px`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
      
      <div className="home-content">
        <h1 className="title">지식 정복 퀴즈 챌린지</h1>
        <p className="description">
          다양한 분야의 퀴즈를 풀고 최고의 지식인이 되어보세요!<br/>
          한국사, 과학, 지리, 예술 등 당신의 실력을 테스트하세요.
        </p>
        
        <div className="home-buttons">
          <button className="btn-start" onClick={() => navigate('/nickname')}>
            게임 시작
          </button>
          <button className="btn-leaderboard" onClick={() => navigate('/leaderboard')}>
            리더보드 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
