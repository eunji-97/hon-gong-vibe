import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import type { Category } from '../types/quiz';
import './CategoryPage.css';

const categories: { name: Category; emoji: string; color: string }[] = [
  { name: '한국사', emoji: '🏛️', color: 'var(--primary-red)' },
  { name: '과학', emoji: '🔬', color: 'var(--primary-blue)' },
  { name: '지리', emoji: '🌍', color: 'var(--primary-green)' },
  { name: '예술과 문화', emoji: '🎨', color: 'var(--primary-purple)' },
];

const CategoryPage: React.FC = () => {
  const { selectCategory, state } = useQuiz();
  const navigate = useNavigate();

  const handleSelect = (category: Category | '전체') => {
    selectCategory(category);
    navigate('/quiz');
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>안녕하세요, {state.nickname}님!</h1>
        <p>도전하고 싶은 카테고리를 선택해 주세요.</p>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            style={{ '--accent-color': cat.color } as React.CSSProperties}
            onClick={() => handleSelect(cat.name)}
          >
            <div className="cat-emoji">{cat.emoji}</div>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>

      <button className="btn-total" onClick={() => handleSelect('전체')}>
        전체 도전 (8문제)
      </button>
    </div>
  );
};

export default CategoryPage;
