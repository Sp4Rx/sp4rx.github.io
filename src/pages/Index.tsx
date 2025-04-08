
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import GameEngine from '@/components/game/GameEngine';
import Resume from '@/components/resume/Resume';

const Index = () => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'AUTO' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('AUTO');
  const cellSize = 20; // Size of each snake segment in pixels

  // Handle key presses for game state changes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (gameState === 'AUTO') {
          setGameState('PLAYING');
        }
      } else if (e.key === ' ') { // Space key
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Callback for score updates from game engine
  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
  };

  return (
    <ThemeProvider>
      <div id='game-container' className="game-container">
        <GameEngine
          cellSize={cellSize}
          onScoreChange={handleScoreChange}
          onGameStateChange={setGameState}
        />
      </div>
      <Resume gameState={gameState} score={score} />
    </ThemeProvider>
  );
};

export default Index;
