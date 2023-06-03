import React from 'react';
import styles from './little-button.module.css';

function LittleButton({ mute, onClickAction, isGenerating, children }) {
  return (
    <div className={!mute ? styles.container : `${styles.container} ${styles.mute}`}>
      <button
        type="button"
        className={isGenerating ? `${styles.button} ${styles.loading}` : `${styles.button}`}
        onClick={!mute ? onClickAction : null}
      >
        { isGenerating ? <span className={styles.loader} /> : children }
      </button>
    </div>
  );
}

export default LittleButton;
