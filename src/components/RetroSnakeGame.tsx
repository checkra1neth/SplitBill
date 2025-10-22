'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 150;

export function RetroSnakeGame({ onClose }: { onClose: () => void }) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Load high score from localStorage and initialize food
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) setHighScore(parseInt(saved));
    setFood(generateFood([{ x: 10, y: 10 }]));
    setIsInitialized(true);
  }, [generateFood]);

  // Game logic
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (directionRef.current) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        return newSnake;
      }

      // Remove tail if no food eaten
      newSnake.pop();
      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood, highScore]);

  // Game loop
  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [moveSnake, gameOver, isPaused]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      const newDirection = (() => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            return directionRef.current !== 'DOWN' ? 'UP' : directionRef.current;
          case 'ArrowDown':
          case 's':
          case 'S':
            return directionRef.current !== 'UP' ? 'DOWN' : directionRef.current;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return directionRef.current !== 'RIGHT' ? 'LEFT' : directionRef.current;
          case 'ArrowRight':
          case 'd':
          case 'D':
            return directionRef.current !== 'LEFT' ? 'RIGHT' : directionRef.current;
          default:
            return directionRef.current;
        }
      })();

      if (newDirection !== directionRef.current) {
        directionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  return (
    <div
      style={{
        padding: '16px',
        background: '#c0c0c0',
        border: '2px outset #ffffff',
        boxShadow: '2px 2px 0 #000000',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px',
          background: '#000080',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        }}
      >
        <span>🐍 SNAKE GAME</span>
        <button
          onClick={onClose}
          className="retro-button"
          style={{
            padding: '2px 8px',
            fontSize: '10px',
            minWidth: 'auto',
          }}
        >
          ✕
        </button>
      </div>

      {/* Score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
        }}
      >
        <div>Score: <strong>{score}</strong></div>
        <div>High Score: <strong>{highScore}</strong></div>
      </div>

      {/* Game canvas */}
      <div
        style={{
          position: 'relative',
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          background: '#000000',
          border: '2px inset #808080',
          margin: '0 auto',
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              background: index === 0 ? '#00ff00' : '#00cc00',
              border: '1px solid #008800',
            }}
          />
        ))}

        {/* Food */}
        <div
          style={{
            position: 'absolute',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
            background: '#ff0000',
            border: '1px solid #cc0000',
            borderRadius: '50%',
          }}
        />

        {/* Game Over overlay */}
        {gameOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <div style={{ marginBottom: '8px' }}>GAME OVER!</div>
            <div style={{ fontSize: '12px', marginBottom: '12px' }}>Score: {score}</div>
            <button onClick={resetGame} className="retro-button" style={{ fontSize: '11px' }}>
              Play Again
            </button>
          </div>
        )}

        {/* Pause overlay */}
        {isPaused && !gameOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            PAUSED
          </div>
        )}
      </div>

      {/* Controls info */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
          lineHeight: '1.4',
        }}
      >
        <div>🎮 Use Arrow Keys or WASD to move</div>
        <div>⏸️ Press SPACE to pause</div>
        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
          💡 Easter egg: Found the secret game!
        </div>
      </div>
    </div>
  );
}
