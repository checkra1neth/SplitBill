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
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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
    if (gameStarted && !gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, moveSnake, gameOver, isPaused]);

  // Change direction helper
  const changeDirection = useCallback((newDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver || !gameStarted) return;
    
    const canChange = (() => {
      switch (newDir) {
        case 'UP': return directionRef.current !== 'DOWN';
        case 'DOWN': return directionRef.current !== 'UP';
        case 'LEFT': return directionRef.current !== 'RIGHT';
        case 'RIGHT': return directionRef.current !== 'LEFT';
      }
    })();

    if (canChange) {
      directionRef.current = newDir;
      setDirection(newDir);
    }
  }, [gameOver, gameStarted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || !gameStarted) return;

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
            return 'UP';
          case 'ArrowDown':
          case 's':
          case 'S':
            return 'DOWN';
          case 'ArrowLeft':
          case 'a':
          case 'A':
            return 'LEFT';
          case 'ArrowRight':
          case 'd':
          case 'D':
            return 'RIGHT';
          default:
            return null;
        }
      })();

      if (newDirection) {
        changeDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, gameStarted, changeDirection]);

  // Touch controls for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !gameStarted || gameOver) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipeDistance = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          changeDirection(deltaX > 0 ? 'RIGHT' : 'LEFT');
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          changeDirection(deltaY > 0 ? 'DOWN' : 'UP');
        }
      }

      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, gameOver, changeDirection]);

  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
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
        {isPaused && !gameOver && gameStarted && (
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

        {/* Start screen */}
        {!gameStarted && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>🐍</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>SNAKE GAME</div>
            <div style={{ fontSize: '10px', textAlign: 'center', lineHeight: '1.4', maxWidth: '200px' }}>
              Eat the red dots to grow!<br />
              Don&apos;t hit walls or yourself
            </div>
            <button onClick={startGame} className="retro-button" style={{ fontSize: '12px', padding: '8px 16px' }}>
              START GAME
            </button>
            <div style={{ fontSize: '9px', color: '#999', marginTop: '8px' }}>
              High Score: {highScore}
            </div>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          marginTop: '12px',
          maxWidth: '180px',
          margin: '12px auto 0',
        }}
      >
        <div />
        <button
          className="retro-button"
          onClick={() => changeDirection('UP')}
          disabled={!gameStarted || gameOver}
          style={{
            padding: '0',
            fontSize: '20px',
            minWidth: 'auto',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▲
        </button>
        <div />
        <button
          className="retro-button"
          onClick={() => changeDirection('LEFT')}
          disabled={!gameStarted || gameOver}
          style={{
            padding: '0',
            fontSize: '20px',
            minWidth: 'auto',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ◀
        </button>
        <button
          className="retro-button"
          onClick={() => setIsPaused(prev => !prev)}
          disabled={!gameStarted || gameOver}
          style={{
            padding: '0',
            fontSize: '14px',
            minWidth: 'auto',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <button
          className="retro-button"
          onClick={() => changeDirection('RIGHT')}
          disabled={!gameStarted || gameOver}
          style={{
            padding: '0',
            fontSize: '20px',
            minWidth: 'auto',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▶
        </button>
        <div />
        <button
          className="retro-button"
          onClick={() => changeDirection('DOWN')}
          disabled={!gameStarted || gameOver}
          style={{
            padding: '0',
            fontSize: '20px',
            minWidth: 'auto',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▼
        </button>
        <div />
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
        <div>🎮 Keyboard: Arrow Keys / WASD</div>
        <div>📱 Mobile: Swipe or use buttons</div>
        <div>⏸️ Press SPACE or ⏸ to pause</div>
        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
          💡 Easter egg: Found the secret game!
        </div>
      </div>
    </div>
  );
}
