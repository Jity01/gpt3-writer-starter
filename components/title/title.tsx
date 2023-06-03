import React from 'react';
import styles from './title.module.css';

function Title({ onClickAction, isSearching }) {
  return (
    <div className={styles.container}>
      <button onClick={onClickAction} className={isSearching ? `${styles.btn} ${styles.isSearching}` : styles.btn}></button>
    </div>
  );
}

export default Title;
