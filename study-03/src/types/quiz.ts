export type Category = '한국사' | '과학' | '지리' | '예술과 문화';

export interface Question {
  id: number;
  category: Category;
  question: string;
  options: string[];
  correctAnswer: number; // index of options
  explanation: string;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  accuracy: number;
  date: string;
}

export interface QuizState {
  nickname: string;
  selectedCategory: Category | '전체' | null;
  currentQuestions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: boolean[];
}
