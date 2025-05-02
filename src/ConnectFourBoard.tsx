import React, { useMemo } from 'react';
import styles from './ConnectFour.module.css';
import ConnectFourCell from './ConnectFourCell';
import AnimatedDisc from './AnimatedDisc';

const ROWS = 6;
const COLS = 7;

interface DiscAnim {
  col: number;
  toRow: number;
  color: number;
}

interface ConnectFourBoardProps {
  board: number[][];
  animDisc: DiscAnim | null;
  animTop: number;
  onCellClick: (col: number) => void;
  isClickable: boolean;
  cellSize: number;
  discSize: number;
}

const ConnectFourBoard: React.FC<ConnectFourBoardProps> = ({
  board,
  animDisc,
  animTop,
  onCellClick,
  isClickable,
  cellSize,
  discSize,
}) => {
  const cellGrid = useMemo(() => (
    [...Array(ROWS)].map((_, r) =>
      [...Array(COLS)].map((_, c) => {
        const disc = board[r][c];
        return (
          <ConnectFourCell
            key={r + '-' + c}
            hasDisc={disc !== 0}
            discColor={disc === 1 ? 'blue' : disc === 2 ? 'red' : null}
            onClick={() => onCellClick(c)}
            isClickable={isClickable}
          />
        );
      })
    )
  ), [board, isClickable, onCellClick]);

  return (
    <div className={styles.connectFourBoard} style={{ position: 'relative' }}>
      {cellGrid}
      {animDisc && (
        <AnimatedDisc
          col={animDisc.col}
          color={animDisc.color === 1 ? 'blue' : 'red'}
          top={animTop}
          cellSize={cellSize}
        />
      )}
    </div>
  );
};

export default ConnectFourBoard; 