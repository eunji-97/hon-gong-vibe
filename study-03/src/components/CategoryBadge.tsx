import React from 'react';
import type { Category } from '../types/quiz';
import './CategoryBadge.css';

const categoryColors: Record<Category, string> = {
  '한국사': 'var(--primary-red)',
  '과학': 'var(--primary-blue)',
  '지리': 'var(--primary-green)',
  '예술과 문화': 'var(--primary-purple)',
};

interface Props {
  category: Category;
}

const CategoryBadge: React.FC<Props> = ({ category }) => {
  return (
    <span 
      className="category-badge" 
      style={{ backgroundColor: categoryColors[category] }}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
