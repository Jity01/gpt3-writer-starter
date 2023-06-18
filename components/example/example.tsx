import React from 'react';
import styles from './example.module.css';

function Example({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>{ children }</div>
    </div>
  );
}

export default Example;
