import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import './LeaderboardPage.css';

const LeaderboardPage: React.FC = () => {
  const { leaderboard, state } = useQuiz();
  const navigate = useNavigate();

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-card">
        <h1>명예의 전당</h1>
        <p className="subtitle">상위 10명의 플레이어</p>

        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>닉네임</th>
                <th>점수</th>
                <th>정답률</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr 
                  key={entry.id} 
                  className={entry.nickname === state.nickname ? 'highlight' : ''}
                >
                  <td className="rank-cell">{getRankEmoji(index)}</td>
                  <td className="nickname-cell">{entry.nickname}</td>
                  <td className="score-cell">{entry.score}</td>
                  <td className="accuracy-cell">{entry.accuracy}%</td>
                  <td className="date-cell">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-back" onClick={() => navigate('/')}>
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPage;
