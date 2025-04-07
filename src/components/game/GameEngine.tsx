import React, { useState, useEffect, useRef, useCallback, TouchEvent } from 'react';
import { useTheme } from '../ThemeProvider';
import { useIsMobile } from '../../hooks/use-mobile';
import { resumeData } from '../../data/resume';
import './GameControls.css';
import './FoodAnimations.css';
import useDebounce from '@/lib/debounce';

// Constant for minimum snake length
const MINIMUM_LENGTH = 4;

// Types
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Point = { x: number; y: number };
export type GameState = 'AUTO' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface GameEngineProps {
  cellSize: number;
  gameSpeed?: number;
  onScoreChange?: (score: number) => void;
  onGameStateChange?: (state: GameState) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({
  cellSize,
  gameSpeed = 150,
  onScoreChange = () => { },
  onGameStateChange = () => { }
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  // Use a state variable to track mobile detection status to handle initial delay
  const isMobileHook = useIsMobile();
  const [isMobile, setIsMobile] = useState(false);

  // Update isMobile state once the hook returns a value and set the appropriate message
  useEffect(() => {
    setIsMobile(isMobileHook);
    // Set the appropriate initial message after mobile detection is complete
    setMessage(isMobileHook ? 'Tap here to start the game' : 'Press arrow keys to start game');
  }, [isMobileHook]);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 } // Initial snake is 4 blocks long
  ]);
  // Initialize food with random position
  const [food, setFood] = useState<Point>(() => {
    const initialX = Math.floor(Math.random() * (Math.floor(window.innerWidth / cellSize) - 1));
    const initialY = Math.floor(Math.random() * (Math.floor(window.innerHeight / cellSize) - 1));
    return { x: initialX, y: initialY };
  });
  const foodRef = useRef<Point>(food);
  // Define food symbols using Unicode characters
  const foodSymbols = ['🍎', '🍊', '🍉', '🍌', '🍇', '🍓', '🍍', '🍒', '🥝', '🥭'];
  const [foodType, setFoodType] = useState<number>(Math.floor(Math.random() * foodSymbols.length));
  // Create a ref for foodType similar to foodRef to hold the most current value
  const foodTypeRef = useRef<number>(foodType);
  // Sync the foodTypeRef with foodType state
  useEffect(() => {
    foodTypeRef.current = foodType;
  }, [foodType]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('AUTO');
  const [score, setScore] = useState(0);
  // Initialize message with a default value that will be updated after mobile detection is complete
  const [message, setMessage] = useState('Loading game...');
  const [showMessage, setShowMessage] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);
  const [autoMoveTimer, setAutoMoveTimer] = useState<number>(0);

  // Touch controls state
  const [touchStart, setTouchStart] = useState<Point | null>(null);
  const [touchEnd, setTouchEnd] = useState<Point | null>(null);
  const [touchIdentifier, setTouchIdentifier] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(isMobile);

  const lastRenderTimeRef = useRef(0);
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef(nextDirection);
  const gameStateRef = useRef(gameState);
  const snakeRef = useRef(snake);

  // Calculate grid dimensions
  const gridWidth = Math.floor(windowSize.width / cellSize);
  const gridHeight = Math.floor(windowSize.height / cellSize);

  // Create refs for grid dimensions to access latest values in callbacks
  const gridWidthRef = useRef(gridWidth);
  const gridHeightRef = useRef(gridHeight);

  // Update grid dimension refs when window size changes
  useEffect(() => {
    gridWidthRef.current = gridWidth;
    gridHeightRef.current = gridHeight;
  }, [gridWidth, gridHeight]);

  // Update refs when states change
  useEffect(() => {
    directionRef.current = direction;
    nextDirectionRef.current = nextDirection;
    gameStateRef.current = gameState;
    snakeRef.current = snake;

    // Notify parent component of game state changes
    onGameStateChange(gameState);
  }, [direction, nextDirection, gameState, snake, onGameStateChange]);

  // Sync food ref with food state
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  const resizeHandler = useCallback(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Update window size state
    setWindowSize({
      width: newWidth,
      height: newHeight
    });

    // Update canvas dimensions
    if (canvasRef.current) {
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
    }
  }, []);

  // Set up window resize listener
  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    return () => window.removeEventListener('resize', resizeHandler);
  }, [resizeHandler]);

  // Cleanup food element when component unmounts
  useEffect(() => {
    return () => {
      const foodElement = document.getElementById('game-food');
      if (foodElement) {
        foodElement.remove();
      }
    };
  }, []);

  // Prevent scrolling when using arrow keys
  useEffect(() => {
    const preventDefaultForArrowKeys = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaultForArrowKeys);
    return () => window.removeEventListener('keydown', preventDefaultForArrowKeys);
  }, []);

  // Check if movement would be in opposite direction
  const isOppositeDirection = (current: Direction, next: Direction): boolean => {
    return (
      (current === 'UP' && next === 'DOWN') ||
      (current === 'DOWN' && next === 'UP') ||
      (current === 'LEFT' && next === 'RIGHT') ||
      (current === 'RIGHT' && next === 'LEFT')
    );
  };

  // Create debounced direction change function at component level
  const debouncedKeyPressDirectionChange = useDebounce((newDirection: Direction) => {
    if (gameStateRef.current === 'PLAYING' && !isOppositeDirection(directionRef.current, newDirection)) {
      console.log('Changing direction:', newDirection);

      setDirection(newDirection);
      setNextDirection(newDirection);
    }
  }, 50);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isArrowKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);

      if (isArrowKey && gameStateRef.current === 'AUTO') {
        setGameState('PLAYING');
        onGameStateChange('PLAYING');
        setShowMessage(false);
        setTimeout(() => {
          setMessage(isMobile ? 'Tap here to pause' : 'Press SPACE to pause');
          setShowMessage(true);
        }, 500);
      }

      if (gameStateRef.current === 'PLAYING') {
        let newDirection: Direction | null = null;
        switch (key) {
          case 'arrowup':
            newDirection = 'UP';
            break;
          case 'arrowdown':
            newDirection = 'DOWN';
            break;
          case 'arrowleft':
            newDirection = 'LEFT';
            break;
          case 'arrowright':
            newDirection = 'RIGHT';
            break;
        }
        if (newDirection) {
          debouncedKeyPressDirectionChange(newDirection);
        }
      }

      // Space key handling for pause/resume
      if (key === ' ') {
        if (gameStateRef.current === 'PLAYING') {
          setGameState('PAUSED');
          onGameStateChange('PAUSED');
          setShowMessage(false);
          setTimeout(() => {
            setMessage(isMobile ? 'Game Paused - Tap to resume' : 'Game Paused - Press SPACE to resume');
            setShowMessage(true);
          }, 500);
        } else if (gameStateRef.current === 'PAUSED') {
          setGameState('PLAYING');
          onGameStateChange('PLAYING');
          setShowMessage(false);
          setTimeout(() => {
            setMessage(isMobile ? 'Tap pause button to pause' : 'Press SPACE to pause');
            setShowMessage(true);
          }, 500);
        }
      } else if (key === 'h') {
        setHelpVisible(!helpVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [helpVisible, isMobile]);

  // Handle touch events for swipe and drag detection
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    // Only track the first finger touch
    if (touchIdentifier !== null) return;

    const touch = e.touches[0];
    setTouchIdentifier(touch.identifier);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (!touchStart || touchIdentifier === null) return;

    // Find the touch with the matching identifier
    let touchObj = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === touchIdentifier) {
        touchObj = e.touches[i];
        break;
      }
    }

    if (!touchObj) return;

    const currentPosition = {
      x: touchObj.clientX,
      y: touchObj.clientY
    };

    setTouchEnd(currentPosition);

    // Handle drag gesture - update direction based on drag movement
    if (isDragging) {
      const xDiff = touchStart.x - currentPosition.x;
      const yDiff = touchStart.y - currentPosition.y;

      // Only change direction if the drag distance is significant
      if (Math.abs(xDiff) > 15 || Math.abs(yDiff) > 15) {
        // Determine if horizontal or vertical movement is dominant
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          // Horizontal drag
          if (xDiff > 0) {
            debouncedDirectionChange('LEFT');
          } else {
            debouncedDirectionChange('RIGHT');
          }
        } else {
          // Vertical drag
          if (yDiff > 0) {
            debouncedDirectionChange('UP');
          } else {
            debouncedDirectionChange('DOWN');
          }
        }

        // Update touch start to current position for continuous movement
        setTouchStart(currentPosition);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    // Check if the ended touch is the one we're tracking
    let touchEnded = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdentifier) {
        touchEnded = true;
        break;
      }
    }

    if (!touchEnded) return;

    if (touchStart && touchEnd) {
      const xDiff = touchStart.x - touchEnd.x;
      const yDiff = touchStart.y - touchEnd.y;

      // Handle final swipe gesture if it was a quick motion
      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // Horizontal swipe
        if (xDiff > 10) {
          debouncedDirectionChange('LEFT');
        } else if (xDiff < -10) {
          debouncedDirectionChange('RIGHT');
        }
      } else {
        // Vertical swipe
        if (yDiff > 10) {
          debouncedDirectionChange('UP');
        } else if (yDiff < -10) {
          debouncedDirectionChange('DOWN');
        }
      }
    }

    // Reset touch tracking
    setTouchStart(null);
    setTouchEnd(null);
    setTouchIdentifier(null);
    setIsDragging(false);
  };

  // Handle touch cancel event
  const handleTouchCancel = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setTouchIdentifier(null);
    setIsDragging(false);
  };

  // Handle direction change from touch controls
  const handleDirectionChange = (newDirection: Direction) => {
    if (gameStateRef.current === 'AUTO') {
      setGameState('PLAYING');
      onGameStateChange('PLAYING');
      setShowMessage(false);
      setTimeout(() => {
        setMessage(isMobile ? 'Tap here to pause' : 'Press SPACE to pause');
        setShowMessage(true);
      }, 500);
    }

    if (gameStateRef.current === 'PLAYING' && !isOppositeDirection(directionRef.current, newDirection)) {

      setDirection(newDirection);
      setNextDirection(newDirection);
    }
  };

  const debouncedDirectionChange = useDebounce((direction: Direction) => {
    handleDirectionChange(direction);
  }, 50);


  // Handle pause/resume from touch controls - now primarily handled by the clickable message
  const handlePauseResume = () => {
    if (gameStateRef.current === 'PLAYING') {
      setGameState('PAUSED');
      onGameStateChange('PAUSED');
      setShowMessage(false);
      setTimeout(() => {
        setMessage(isMobile ? 'Tap here to resume' : 'Press SPACE to resume');
        setShowMessage(true);
      }, 500);
    } else if (gameStateRef.current === 'PAUSED') {
      setGameState('PLAYING');
      onGameStateChange('PLAYING');
      setShowMessage(false);
      setTimeout(() => {
        setMessage(isMobile ? 'Tap here to pause' : 'Press SPACE to pause');
        setShowMessage(true);
      }, 500);
    }
  };

  // Generate food in a position not occupied by the snake
  const generateFood = useCallback((): Point => {
    // Use refs to get the most current grid dimensions
    const currentGridWidth = gridWidthRef.current;
    const currentGridHeight = gridHeightRef.current;

    const newFood = {
      x: Math.floor(Math.random() * (currentGridWidth - 1)),
      y: Math.floor(Math.random() * (currentGridHeight - 1))
    };

    // Generate a new random food type when creating new food
    const newFoodType = Math.floor(Math.random() * foodSymbols.length);
    setFoodType(newFoodType);

    const isOnSnake = snakeRef.current.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    );

    if (isOnSnake) {
      return generateFood();
    }

    setFood(newFood);
    return newFood;
  }, []);

  // Initialize food when component mounts or window resizes
  useEffect(() => {
    // When window size changes, we need to ensure food is within new boundaries
    const newGridWidth = Math.floor(windowSize.width / cellSize);
    const newGridHeight = Math.floor(windowSize.height / cellSize);

    // Check if current food is out of bounds in new grid dimensions
    if (food.x >= newGridWidth || food.y >= newGridHeight) {
      console.log('Food is out of bounds. Adjusting...');
      setFood(generateFood());
      // Update food type when repositioning due to resize
      setFoodType(Math.floor(Math.random() * foodSymbols.length));
    }

    // Adjust snake position if it's out of bounds
    setSnake(prevSnake => {
      return prevSnake.map(segment => ({
        x: segment.x >= newGridWidth ? newGridWidth - 1 : segment.x,
        y: segment.y >= newGridHeight ? newGridHeight - 1 : segment.y
      }));
    });

    // Update food element position if it exists
    const foodElement = document.getElementById('game-food');
    if (foodElement) {
      foodElement.style.left = `${food.x * cellSize}px`;
      foodElement.style.top = `${food.y * cellSize}px`;
    }
  }, [generateFood, windowSize, cellSize, food.x, food.y, foodSymbols.length]);

  // Check if snake collided with itself and return the collision index, if any.
  const checkSelfCollision = useCallback((head: Point, body: Point[]) => {
    for (let i = 1; i < body.length; i++) {
      if (head.x === body[i].x && head.y === body[i].y) {
        return i;
      }
    }
    return -1;
  }, []);

  // Update score when snake eats food
  const updateScore = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      setScore(prev => prev + 10);
      const newFood = generateFood();
      // Food type is already updated in generateFood function
      return newFood;
    }
    return foodRef.current;
  }, [generateFood]);

  // Increment auto move timer
  const incrementAutoMoveTimer = useCallback(() => {
    setAutoMoveTimer(prev => prev + 1);
  }, []);

  // Get random direction for auto mode, avoiding backward movement
  const getRandomDirection = useCallback((currentDirection: Direction): Direction => {
    const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const invalidDirection =
      currentDirection === 'UP' ? 'DOWN' :
        currentDirection === 'DOWN' ? 'UP' :
          currentDirection === 'LEFT' ? 'RIGHT' : 'LEFT';

    const validDirections = possibleDirections.filter(dir => dir !== invalidDirection);
    return validDirections[Math.floor(Math.random() * validDirections.length)];
  }, []);

  // Change direction randomly in auto/paused mode
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (gameStateRef.current === 'AUTO' || gameStateRef.current === 'PAUSED') {
      intervalId = setInterval(() => {
        if (Math.random() < 0.2) {
          const newDirection = getRandomDirection(directionRef.current);
          setDirection(newDirection);
          setNextDirection(newDirection);
        }
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameState, getRandomDirection]);

  // Get auto direction towards food while avoiding self-collision
  const getAutoDirection = useCallback((head: Point, food: Point, currentDirection: Direction): Direction => {
    // Use refs to get the most current grid dimensions
    const currentGridWidth = gridWidthRef.current;
    const currentGridHeight = gridHeightRef.current;

    const distances = {
      UP: { x: head.x, y: (head.y - 1 + currentGridHeight) % currentGridHeight },
      DOWN: { x: head.x, y: (head.y + 1) % currentGridHeight },
      LEFT: { x: (head.x - 1 + currentGridWidth) % currentGridWidth, y: head.y },
      RIGHT: { x: (head.x + 1) % currentGridWidth, y: head.y }
    };

    const oppositeDirections = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    };

    const invalidDirection = oppositeDirections[currentDirection];
    const validDirections = (Object.keys(distances) as Direction[]).filter(dir => {
      if (dir === invalidDirection) return false;
      const newPos = distances[dir];
      const wouldCollide = snakeRef.current.some((segment, i) => {
        if (i === snakeRef.current.length - 1) return false;
        return segment.x === newPos.x && segment.y === newPos.y;
      });
      return !wouldCollide;
    });

    if (validDirections.length === 0) {
      return currentDirection;
    }

    incrementAutoMoveTimer();

    const directionScores = validDirections.map(dir => {
      const newPos = distances[dir];
      const distance = Math.abs(newPos.x - food.x) + Math.abs(newPos.y - food.y);
      return { direction: dir, score: -distance };
    });

    directionScores.sort((a, b) => b.score - a.score);

    if (Math.random() < 0.15) {
      return validDirections[Math.floor(Math.random() * validDirections.length)];
    }

    return directionScores[0].direction;
  }, [incrementAutoMoveTimer]);

  // Main game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const deltaTime = timestamp - lastRenderTimeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gameLoopExecution = (deltaTime: number) => {
        const currentGameState = gameStateRef.current;
        const currentSnake = snakeRef.current;

        // Apply direction change if not opposite
        if (nextDirectionRef.current && !isOppositeDirection(directionRef.current, nextDirectionRef.current)) {
          directionRef.current = nextDirectionRef.current;
        }

        let newHead: Point;
        if (currentGameState === 'AUTO' || currentGameState === 'PAUSED') {
          const autoDirection = getAutoDirection(currentSnake[0], foodRef.current, directionRef.current);
          directionRef.current = autoDirection;
        }

        // Use refs to get the most current grid dimensions
        const currentGridWidth = gridWidthRef.current;
        const currentGridHeight = gridHeightRef.current;

        switch (directionRef.current) {
          case 'UP':
            newHead = { x: currentSnake[0].x, y: (currentSnake[0].y - 1 + currentGridHeight) % currentGridHeight };
            break;
          case 'DOWN':
            newHead = { x: currentSnake[0].x, y: (currentSnake[0].y + 1) % currentGridHeight };
            break;
          case 'LEFT':
            newHead = { x: (currentSnake[0].x - 1 + currentGridWidth) % currentGridWidth, y: currentSnake[0].y };
            break;
          case 'RIGHT':
          default:
            newHead = { x: (currentSnake[0].x + 1) % currentGridWidth, y: currentSnake[0].y };
            break;
        }

        // Check for self-collision
        const collisionIndex = checkSelfCollision(newHead, currentSnake);
        let newSnake: Point[];

        if (collisionIndex !== -1 && currentGameState === 'PLAYING') {
          // If collision occurs and trimming would keep snake at or above MINIMUM_LENGTH,
          // then trim from collision index onward.
          if (collisionIndex >= MINIMUM_LENGTH) {
            newSnake = [newHead, ...currentSnake.slice(0, collisionIndex)];
          } else {
            // Otherwise, keep at least MINIMUM_LENGTH segments.
            newSnake = [newHead, ...currentSnake.slice(0, MINIMUM_LENGTH - 1)];
          }
          setScore(Math.max(0, newSnake.length - MINIMUM_LENGTH));
        } else {
          newSnake = [newHead, ...currentSnake];
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            if (currentGameState === 'PLAYING') {
              updateScore();
              setScore(newSnake.length - MINIMUM_LENGTH);
            } else {
              setFood(generateFood());
              newSnake.pop();
            }
          } else {
            newSnake.pop();
          }
        }

        setSnake(newSnake);
        snakeRef.current = newSnake;
        drawGameElements(ctx, newSnake, foodRef.current);
      };

      if (deltaTime > gameSpeed || lastRenderTimeRef.current === 0) {
        lastRenderTimeRef.current = timestamp;
        if (
          gameStateRef.current === 'PLAYING' ||
          gameStateRef.current === 'AUTO' ||
          gameStateRef.current === 'PAUSED'
        ) {
          gameLoopExecution(deltaTime);
        }
      } else {
        drawGameElements(ctx, snakeRef.current, foodRef.current);
      }

      requestAnimationFrame(gameLoop);
    };

    const animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [theme, gameSpeed, generateFood, checkSelfCollision, getAutoDirection]);

  // Initialize snake starting position and direction
  useEffect(() => {
    const randomEdgePosition = (): Point => {
      // Use refs to get the most current grid dimensions
      const currentGridWidth = gridWidthRef.current;
      const currentGridHeight = gridHeightRef.current;

      const edge = Math.floor(Math.random() * 4);
      switch (edge) {
        case 0:
          return { x: Math.floor(Math.random() * currentGridWidth), y: 0 };
        case 1:
          return { x: currentGridWidth - 1, y: Math.floor(Math.random() * currentGridHeight) };
        case 2:
          return { x: Math.floor(Math.random() * currentGridWidth), y: currentGridHeight - 1 };
        case 3:
          return { x: 0, y: Math.floor(Math.random() * currentGridHeight) };
        default:
          return { x: 0, y: 0 };
      }
    };

    const startingPosition = randomEdgePosition();
    let initialDirection: Direction;
    // Use refs to get the most current grid dimensions
    const currentGridWidth = gridWidthRef.current;
    const currentGridHeight = gridHeightRef.current;

    if (startingPosition.x === 0) initialDirection = 'RIGHT';
    else if (startingPosition.x === currentGridWidth - 1) initialDirection = 'LEFT';
    else if (startingPosition.y === 0) initialDirection = 'DOWN';
    else initialDirection = 'UP';

    const initialSnake: Point[] = [];
    for (let i = 0; i < MINIMUM_LENGTH; i++) {
      switch (initialDirection) {
        case 'RIGHT':
          initialSnake.push({
            x: (startingPosition.x - i + currentGridWidth) % currentGridWidth,
            y: startingPosition.y
          });
          break;
        case 'LEFT':
          initialSnake.push({
            x: (startingPosition.x + i) % currentGridWidth,
            y: startingPosition.y
          });
          break;
        case 'UP':
          initialSnake.push({
            x: startingPosition.x,
            y: (startingPosition.y + i) % currentGridHeight
          });
          break;
        case 'DOWN':
          initialSnake.push({
            x: startingPosition.x,
            y: (startingPosition.y - i + currentGridHeight) % currentGridHeight
          });
          break;
      }
    }

    setSnake(initialSnake);
    setDirection(initialDirection);
    setNextDirection(initialDirection);
  }, []);

  // Draw game elements
  const drawGameElements = (
    ctx: CanvasRenderingContext2D,
    snake: Point[],
    food: Point
  ) => {
    // Draw snake segments first
    snake.forEach((segment, index) => {
      let color;
      if (index === 0) color = isDarkMode ? '#a487ff' : '#6E59A5';
      else if (index === 1 || index === 2) color = isDarkMode ? '#b59dff' : '#7E69AB';
      else if (index === 3) color = isDarkMode ? '#c6b5ff' : '#9b87f5';
      else color = isDarkMode ? '#d4c9ff' : '#b8abfa';

      ctx.fillStyle = color;
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
      ctx.strokeRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });

    // Check if food element exists
    let foodElement = document.getElementById('game-food');

    // Only create or update food element if it doesn't exist or if food position has changed
    if (!foodElement) {
      // Create a new food element
      foodElement = document.createElement('div');
      foodElement.id = 'game-food';
      foodElement.className = 'game-food';
      foodElement.style.width = `${cellSize}px`;
      foodElement.style.height = `${cellSize}px`;
      foodElement.style.zIndex = '5'; // Set z-index to be below resume content (z-index: 10) but above game area (z-index: -10)
      foodElement.textContent = foodSymbols[foodTypeRef.current];

      // Add the food element to the document
      const gameContainer = canvasRef.current?.parentElement;
      if (gameContainer) {
        gameContainer.appendChild(foodElement);
      }
    }

    // Always update position (in case window was resized)
    if (foodElement) {
      foodElement.style.left = `${food.x * cellSize}px`;
      foodElement.style.top = `${food.y * cellSize}px`;

      // Only update the food symbol if it doesn't match the current food type from the ref
      if (foodElement.textContent !== foodSymbols[foodTypeRef.current]) {
        foodElement.textContent = foodSymbols[foodTypeRef.current];
      }
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={windowSize.width}
        height={windowSize.height}
        className="game-area"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />

      <div className="fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm px-3 py-2 pixel-box text-foreground font-pixel text-xs md:text-sm">
        Score: {score}
      </div>

      {showMessage && (
        <div
          className={`fixed bottom-4 left-4 z-40 bg-background/80 backdrop-blur-[2px] px-4 py-2 pixel-box text-foreground font-pixel animate-fade-in text-xs md:text-sm ${isMobile ? 'cursor-pointer hover:bg-background/90 transition-colors' : ''}`}
          style={{ maxWidth: isMobile ? 'calc(100% - 100px)' : 'auto' }}
          onClick={() => {
            // Only process click events on mobile devices
            if (!isMobile) return;

            if (gameStateRef.current === 'AUTO') {
              setGameState('PLAYING');
              onGameStateChange('PLAYING');
              setShowMessage(false);
              setTimeout(() => {
                setMessage(isMobile ? 'Tap here to pause' : 'Press SPACE to pause');
                setShowMessage(true);
              }, 500);
            } else if (gameStateRef.current === 'PLAYING') {
              setGameState('PAUSED');
              onGameStateChange('PAUSED');
              setShowMessage(false);
              setTimeout(() => {
                setMessage('Tap here to resume');
                setShowMessage(true);
              }, 500);
            } else if (gameStateRef.current === 'PAUSED') {
              setGameState('PLAYING');
              onGameStateChange('PLAYING');
              setShowMessage(false);
              setTimeout(() => {
                setMessage('Tap here to pause');
                setShowMessage(true);
              }, 500);
            }
          }}
        >
          {message}
        </div>
      )}

      <div className="help-icon" onClick={() => setHelpVisible(!helpVisible)}>
        ?
      </div>

      {/* Mobile touch controls - only showing directional controls since pause is handled by the message */}
      {showControls && gameState !== 'AUTO' && (
        <div className="touch-controls grid grid-cols-3 gap-2">
          {/* Up button */}
          <div className="col-start-2 col-span-1">
            <button
              className="w-16 h-16 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl"
              onTouchStart={() => debouncedDirectionChange('UP')}
            >
              ↑
            </button>
          </div>

          {/* Left and Right buttons */}
          <div className="col-span-1">
            <button
              className="w-16 h-16 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl"
              onTouchStart={() => debouncedDirectionChange('LEFT')}
            >
              ←
            </button>
          </div>

          {/* Empty middle cell to maintain grid layout */}
          <div className="col-span-1"></div>

          <div className="col-span-1">
            <button
              className="w-16 h-16 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl"
              onTouchStart={() => debouncedDirectionChange('RIGHT')}
            >
              →
            </button>
          </div>

          {/* Down button */}
          <div className="col-start-2 col-span-1">
            <button
              className="w-16 h-16 bg-primary/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl"
              onTouchStart={() => debouncedDirectionChange('DOWN')}
            >
              ↓
            </button>
          </div>
        </div>
      )}

      {helpVisible && (
        <div className="help-dialog">
          <div className="help-content">
            <div className="help-scrollable">
              <h2 className="text-xl font-pixel mb-4 text-primary">Game Controls</h2>
              <ul className="space-y-2 mb-6">
                {isMobile ? (
                  <>
                    <li><span className="font-bold">Directional Buttons</span>: Control snake direction</li>
                    <li><span className="font-bold">Swipe</span>: Quick swipe in any direction to move the snake</li>
                    <li><span className="font-bold">Drag</span>: Touch and drag continuously to control snake direction</li>
                    <li><span className="font-bold">Game Message</span>: Tap the message to pause/resume game</li>
                  </>
                ) : (
                  <>
                    <li><span className="font-bold">↑, ↓, ←, →</span>: Control snake direction</li>
                    <li><span className="font-bold">SPACE</span>: Pause/Resume game</li>
                  </>
                )}
                <li><span className="font-bold">H</span>: Toggle this help screen</li>
              </ul>
              <h3 className="text-lg font-pixel mb-2 text-primary">How to Play</h3>
              <p className="mb-6">
                {isMobile ?
                  "Use directional buttons, swipe, or drag your finger to navigate the snake. Tap the game message to start, pause, or resume the game. For continuous control, keep your finger on the screen and drag in the direction you want to move. Collect colorful fruits to grow your snake and increase your score. If your snake hits itself, it will be trimmed from the collision point until the tail but will never go below the initial length." :
                  "Use arrow keys to navigate the snake. Collect colorful fruits to grow your snake and increase your score. If your snake hits itself, it will be trimmed from the collision point until the tail but will never go below the initial length. Press SPACE to pause/resume the game."}
              </p>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-4">Report bugs at: <a href={`mailto:${resumeData.basics.email}`} className="text-primary hover:underline">{resumeData.basics.email}</a></p>
              </div>
            </div>
            <div className="help-footer">
              <button className="pixel-button mx-auto block" onClick={() => setHelpVisible(false)}>
                Close Help
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GameEngine;
