import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import './NicknamePage.css';

const NicknamePage: React.FC = () => {
  const [input, setInput] = useState('');
  const { setNickname } = useQuiz();
  const navigate = useNavigate();

  const handleNext = () => {
    if (input.trim().length === 0) return;
    setNickname(input.trim());
    navigate('/category');
  };

  return (
    <div className="nickname-page">
      <div className="card">
        <h2>플레이어 닉네임 입력</h2>
        <p>당신의 이름을 알려주세요! (최대 10자)</p>
        
        <div className="input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 10))}
            placeholder="닉네임을 입력하세요"
            autoFocus
          />
          <span className="char-count">{input.length}/10</span>
        </div>

        <button 
          className="btn-next" 
          onClick={handleNext}
          disabled={input.trim().length === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default NicknamePage;
