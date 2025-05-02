import React from 'react';
import styles from './ConnectFour.module.css';

const ConnectFourLegs: React.FC = () => (
  <>
    <div className={styles.boardLegsLeft} />
    <div className={styles.boardLegsRight} />
  </>
);

export default ConnectFourLegs; 