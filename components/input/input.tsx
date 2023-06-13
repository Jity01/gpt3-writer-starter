import styles from './input.module.css';
import React from 'react';

function Input({ placeholder, value, onChangeAction }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value} 
      onChange={onChangeAction}
      className={styles.input}
    />
  );
}

export default Input;
