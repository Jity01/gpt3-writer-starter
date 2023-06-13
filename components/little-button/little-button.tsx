import React from 'react';
import styles from './little-button.module.css';

function LittleButton({ mute, onClickAction, isGenerating, children }) {
  const generateClassName = () => {
    if (isGenerating & mute) return `${styles.button} ${styles.loading} ${styles.mute}`;
    if (isGenerating) return `${styles.button} ${styles.loading}`;
    if (mute) return `${styles.button} ${styles.mute}`;
    return `${styles.button}`;
  }
  return (
      <button
        type="button"
        className={generateClassName()}
        onClick={!mute ? onClickAction : null}
      >
        { isGenerating ? <span className={styles.loader} /> : children }
      </button>
  );
}

export default LittleButton;
