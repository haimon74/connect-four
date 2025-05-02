import React from 'react';
import styles from './ConnectFour.module.css';

type DiscColor = 'blue' | 'red' | null;

interface ConnectFourCellProps {
  hasDisc: boolean;
  discColor: DiscColor;
  onClick: () => void;
  isClickable: boolean;
}

const ConnectFourCell: React.FC<ConnectFourCellProps> = ({ hasDisc, discColor, onClick, isClickable }) => (
  <div
    className={styles.connectFourCell}
    onClick={onClick}
    style={{ cursor: isClickable ? 'pointer' : 'default' }}
  >
    {hasDisc && discColor && (
      <div className={`${styles.connectFourDisc} ${styles[discColor]}`} style={{ top: 0 }} />
    )}
  </div>
);

export default ConnectFourCell; 