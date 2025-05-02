import React from 'react';
import styles from './ConnectFour.module.css';

interface AnimatedDiscProps {
  col: number;
  color: 'blue' | 'red';
  top: number;
  cellSize: number;
}

const AnimatedDisc: React.FC<AnimatedDiscProps> = ({ col, color, top, cellSize }) => (
  <div
    className={`${styles.connectFourDisc} ${styles[color]}`}
    style={{
      position: 'absolute',
      left: `${col * cellSize + (cellSize / 2)}px`,
      top: `${top}px`,
      zIndex: 10,
      pointerEvents: 'none',
    }}
  />
);

export default AnimatedDisc; 