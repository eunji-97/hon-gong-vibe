import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Category, LeaderboardEntry, QuizState } from '../types/quiz';
import { quizData } from '../data/quizData';

interface QuizContextType {
  state: QuizState;
  setNickname: (nickname: string) => void;
  selectCategory: (category: Category | '전체') => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  leaderboard: LeaderboardEntry[];
  addToLeaderboard: (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<QuizState>({
    nickname: '',
    selectedCategory: null,
    currentQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', nickname: '퀴즈마스터', score: 100, accuracy: 100, date: '2024-05-01' },
    { id: '2', nickname: '지식인', score: 80, accuracy: 80, date: '2024-05-02' },
    { id: '3', nickname: '초보자', score: 40, accuracy: 40, date: '2024-05-03' },
  ]);

  const setNickname = (nickname: string) => {
    setState((prev) => ({ ...prev, nickname }));
  };

  const selectCategory = (category: Category | '전체') => {
    let filteredQuestions = [];
    if (category === '전체') {
      filteredQuestions = [...quizData].sort(() => Math.random() - 0.5);
    } else {
      filteredQuestions = quizData.filter((q) => q.category === category).sort(() => Math.random() - 0.5);
    }

    setState((prev) => ({
      ...prev,
      selectedCategory: category,
      currentQuestions: filteredQuestions,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
    }));
  };

  const answerQuestion = (isCorrect: boolean) => {
    setState((prev) => ({
      ...prev,
      score: isCorrect ? prev.score + 10 : prev.score,
      answers: [...prev.answers, isCorrect],
    }));
  };

  const nextQuestion = () => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  };

  const resetQuiz = () => {
    setState((prev) => ({
      ...prev,
      selectedCategory: null,
      currentQuestions: [],
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
    }));
  };

  const addToLeaderboard = (entry: Omit<LeaderboardEntry, 'id' | 'date'>) => {
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setLeaderboard((prev) => [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10));
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        setNickname,
        selectCategory,
        answerQuestion,
        nextQuestion,
        resetQuiz,
        leaderboard,
        addToLeaderboard,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
