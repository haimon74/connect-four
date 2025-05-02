import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ConnectFour.module.css';
import ConnectFourBoard from './ConnectFourBoard';
import ConnectFourLegs from './ConnectFourLegs';

const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const BLUE = 1; // Player
const RED = 2;  // Computer
const CELL_SIZE = 64; // px (should match .connectFour-cell width+margin)
const DISC_SIZE = 54; // px (should match .connectFour-disc width)
const DROP_START = -70; // px
const DROP_DURATION = 420; // ms

function createEmptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function checkWinner(board: number[][]): number | 'draw' | null {
  // Horizontal, vertical, diagonal checks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c];
      if (player === EMPTY) continue;
      // Horizontal
      if (c + 3 < COLS && [0,1,2,3].every(i => board[r][c+i] === player)) return player;
      // Vertical
      if (r + 3 < ROWS && [0,1,2,3].every(i => board[r+i][c] === player)) return player;
      // Diagonal \
      if (r + 3 < ROWS && c + 3 < COLS && [0,1,2,3].every(i => board[r+i][c+i] === player)) return player;
      // Diagonal //
      if (r + 3 < ROWS && c - 3 >= 0 && [0,1,2,3].every(i => board[r+i][c-i] === player)) return player;
    }
  }
  // Draw
  if (board.every(row => row.every(cell => cell !== EMPTY))) return 'draw';
  return null;
}

function getAvailableRow(board: number[][], col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) return r;
  }
  return null;
}

function getValidColumns(board: number[][]): number[] {
  return board[0].map((_, c) => c).filter(c => board[0][c] === EMPTY);
}

function computerChooseColumn(board: number[][]): number {
  // Simple AI: block player win, else random
  const validCols = getValidColumns(board);
  // Block player win
  for (const col of validCols) {
    const row = getAvailableRow(board, col);
    if (row === null) continue;
    const temp = board.map(r => [...r]);
    temp[row][col] = BLUE;
    if (checkWinner(temp) === BLUE) return col;
  }
  // Try to win
  for (const col of validCols) {
    const row = getAvailableRow(board, col);
    if (row === null) continue;
    const temp = board.map(r => [...r]);
    temp[row][col] = RED;
    if (checkWinner(temp) === RED) return col;
  }
  // Otherwise random
  return validCols[Math.floor(Math.random() * validCols.length)];
}

interface DiscAnim {
  col: number;
  toRow: number;
  color: number;
}

const ConnectFourGame: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Blue always starts
  const [winner, setWinner] = useState<number | 'draw' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDisc, setAnimDisc] = useState<DiscAnim | null>(null);
  const [animTop, setAnimTop] = useState<number>(DROP_START);
  const animFrame = useRef<number | null>(null);

  useEffect(() => {
    if (winner || isPlayerTurn || isAnimating) return;
    const timeout = setTimeout(() => {
      const col = computerChooseColumn(board);
      handleDiscDrop(col, RED);
    }, 700);
    return () => clearTimeout(timeout);
  }, [isPlayerTurn, winner, isAnimating, board]);

  function animateDiscDrop(toRow: number, onDone: () => void) {
    const start = performance.now();
    const endTop = toRow * CELL_SIZE - (DISC_SIZE / 2);
    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / DROP_DURATION, 1);
      // Ease with cubic-bezier(.68,-0.55,.27,1.55) approximation
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setAnimTop(DROP_START + (endTop - DROP_START) * ease);
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(step);
      } else {
        onDone();
      }
    }
    setAnimTop(DROP_START);
    animFrame.current = requestAnimationFrame(step);
  }

  function handleDiscDrop(col: number, color: number) {
    if (isAnimating || winner) return;
    const row = getAvailableRow(board, col);
    if (row === null) return;
    setIsAnimating(true);
    setAnimDisc({ col, toRow: row, color });
    animateDiscDrop(row, () => {
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = color;
      setBoard(newBoard);
      setAnimDisc(null);
      setIsAnimating(false);
      const result = checkWinner(newBoard);
      if (result) setWinner(result);
      else setIsPlayerTurn(color === RED);
    });
  }

  const handleCellClick = useCallback((col: number) => {
    if (!isPlayerTurn || isAnimating || winner) return;
    handleDiscDrop(col, BLUE);
  }, [isPlayerTurn, isAnimating, winner, board]);

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setWinner(null);
    setAnimDisc(null);
    setIsAnimating(false);
    setAnimTop(DROP_START);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <div className={styles.connectFourContainer}>
      <div className={styles.connectFourTitle}>Connect Four</div>
      <div className={styles.connectFourInfo}>
        {winner
          ? winner === BLUE
            ? 'You win! 🎉'
            : winner === RED
            ? 'Computer wins!'
            : 'Draw!'
          : isPlayerTurn
          ? 'Your turn (Blue)'
          : 'Computer thinking...'}
      </div>
      <div className={styles.boardStand} style={{ position: 'relative' }}>
        <ConnectFourLegs />
        <ConnectFourBoard
          board={board}
          animDisc={animDisc}
          animTop={animTop}
          onCellClick={handleCellClick}
          isClickable={isPlayerTurn && !isAnimating && !winner}
          cellSize={CELL_SIZE}
          discSize={DISC_SIZE}
        />
      </div>
      {winner && (
        <div className={styles.connectFourWinner}>
          {winner === BLUE
            ? 'Congratulations! You win!'
            : winner === RED
            ? 'Computer wins!'
            : 'Draw!'}
        </div>
      )}
      <button className={styles.connectFourBtn} onClick={handleRestart}>
        Restart Game
      </button>
    </div>
  );
};

export default ConnectFourGame;
