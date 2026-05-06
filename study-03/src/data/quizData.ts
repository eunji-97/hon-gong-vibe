import type { Question } from '../types/quiz';

export const quizData: Question[] = [
  // 한국사
  {
    id: 1,
    category: '한국사',
    question: '조선 왕조를 세운 인물은 누구인가요?',
    options: ['세종대왕', '이성계', '이순신', '왕건'],
    correctAnswer: 1,
    explanation: '이성계(태조)는 1392년 조선을 건국하였습니다.'
  },
  {
    id: 2,
    category: '한국사',
    question: '3.1 운동이 일어난 해는 언제인가요?',
    options: ['1910년', '1919년', '1945년', '1950년'],
    correctAnswer: 1,
    explanation: '3.1 운동은 1919년 일제 강점기에 일어난 독립 만세 운동입니다.'
  },
  // 과학
  {
    id: 3,
    category: '과학',
    question: '태양계에서 가장 큰 행성은 무엇인가요?',
    options: ['지구', '화성', '목성', '토성'],
    correctAnswer: 2,
    explanation: '목성은 태양계에서 가장 크고 무거운 행성입니다.'
  },
  {
    id: 4,
    category: '과학',
    question: '물의 화학 기호는 무엇인가요?',
    options: ['CO2', 'O2', 'H2O', 'NaCl'],
    correctAnswer: 2,
    explanation: '물의 화학 기호는 수소 원자 2개와 산소 원자 1개가 결합한 H2O입니다.'
  },
  // 지리
  {
    id: 5,
    category: '지리',
    question: '세계에서 가장 넓은 나라는 어디인가요?',
    options: ['미국', '중국', '러시아', '캐나다'],
    correctAnswer: 2,
    explanation: '러시아는 면적 약 1,710만 ㎢로 세계에서 가장 넓은 영토를 가진 나라입니다.'
  },
  {
    id: 6,
    category: '지리',
    question: '한반도에서 가장 높은 산은 어디인가요?',
    options: ['한라산', '설악산', '지리산', '백두산'],
    correctAnswer: 3,
    explanation: '백두산은 해발 2,744m로 한반도에서 가장 높은 산입니다.'
  },
  // 예술과 문화
  {
    id: 7,
    category: '예술과 문화',
    question: '모나리자를 그린 화가는 누구인가요?',
    options: ['빈센트 반 고흐', '파블로 피카소', '레오나르도 다 빈치', '미켈란젤로'],
    correctAnswer: 2,
    explanation: '모나리자는 르네상스 시대의 거장 레오나르도 다 빈치의 대표작입니다.'
  },
  {
    id: 8,
    category: '예술과 문화',
    question: '베토벤의 교향곡 중 "합창"이라는 별칭이 붙은 곡은 몇 번인가요?',
    options: ['5번', '6번', '7번', '9번'],
    correctAnswer: 3,
    explanation: '베토벤 교향곡 9번 D단조 Op. 125는 마지막 악장에 합창이 포함되어 "합창 교향곡"이라 불립니다.'
  }
];
