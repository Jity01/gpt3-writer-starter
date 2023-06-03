import React from 'react';
import styles from './alert.module.css';

function Alert({ type, children }) {
  return (
    <div className={type === "error" ? `${styles.container} ${styles.error}` : styles.container}>
      { children }
    </div>
  );
}

export default Alert;