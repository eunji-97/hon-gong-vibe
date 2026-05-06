import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import CategoryBadge from '../components/CategoryBadge';
import './QuizPage.css';

const QuizPage: React.FC = () => {
  const { state, answerQuestion, nextQuestion } = useQuiz();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const currentQuestion = state.currentQuestions[state.currentQuestionIndex];

  useEffect(() => {
    if (!state.selectedCategory) {
      navigate('/category');
    }
  }, [state.selectedCategory, navigate]);

  if (!currentQuestion) return null;

  const handleOptionClick = (index: number) => {
    if (showFeedback || isTimeUp) return;
    setSelectedOption(index);
    setShowFeedback(true);
    answerQuestion(index === currentQuestion.correctAnswer);
  };

  const handleTimeUp = () => {
    if (showFeedback) return;
    setIsTimeUp(true);
    setShowFeedback(true);
    answerQuestion(false);
  };

  const handleNext = () => {
    if (state.currentQuestionIndex + 1 < state.currentQuestions.length) {
      setSelectedOption(null);
      setShowFeedback(false);
      setIsTimeUp(false);
      nextQuestion();
    } else {
      navigate('/result');
    }
  };

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <div className="header-info">
            <CategoryBadge category={currentQuestion.category} />
            <span className="question-number">문제 {state.currentQuestionIndex + 1}</span>
          </div>
          <ProgressBar current={state.currentQuestionIndex + 1} total={state.currentQuestions.length} />
        </div>

        <Timer initialSeconds={20} onTimeUp={handleTimeUp} isActive={!showFeedback} />

        <div className="question-box">
          <h2 className="question-text">{currentQuestion.question}</h2>
        </div>

        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            let className = "option-button";
            const isCorrect = index === currentQuestion.correctAnswer;
            const isSelected = index === selectedOption;

            if (showFeedback) {
              if (isCorrect) className += " correct";
              else if (isSelected) className += " incorrect";
              else className += " disabled";
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback}
              >
                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                <span className="option-content">{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`feedback-area ${selectedOption === currentQuestion.correctAnswer ? 'success' : 'error'}`}>
            <div className="feedback-message">
              {isTimeUp ? '⏰ 시간 초과!' : selectedOption === currentQuestion.correctAnswer ? '✅ 정답입니다!' : '❌ 오답입니다!'}
            </div>
            <p className="explanation">{currentQuestion.explanation}</p>
            <button className="btn-next-question" onClick={handleNext}>
              {state.currentQuestionIndex + 1 === state.currentQuestions.length ? '결과 보기' : '다음 문제'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
