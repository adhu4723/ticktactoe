import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Auth from './Auth';

const socket = io('http://localhost:4000');

export default function App() {
  const [username, setUsername] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));

  useEffect(() => {
    if (username) {
      socket.emit('join-game', username);

      socket.on('player-assigned', setSymbol);
      socket.on('waiting', () => alert('Waiting for another player...'));
      socket.on('board-update', setBoard);
      socket.on('game-over', (winner) => {
        if (winner === 'draw') alert("It's a draw!");
        else alert(`Player ${winner} wins!`);
      });

      return () => {
        socket.off('player-assigned');
        socket.off('waiting');
        socket.off('board-update');
        socket.off('game-over');
      };
    }
  }, [username]);

  const handleClick = (index) => {
    if (symbol && board[index] === null) {
      socket.emit('make-move', index);
    }
  };

  return username ? (
    <div style={{ textAlign: 'center' }}>
      <h2>Welcome, {username} - You are {symbol}</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 100px)',
        margin: '20px auto',
        gap: '5px',
      }}>
        {board.map((cell, i) => (
          <div key={i} onClick={() => handleClick(i)}
            style={{
              width: 100, height: 100, fontSize: '2rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '1px solid black', cursor: 'pointer'
            }}>
            {cell}
          </div>
        ))}
      </div>
      <button onClick={() => socket.emit('reset')}>Reset</button>
    </div>
  ) : <Auth onAuth={setUsername} />;
}