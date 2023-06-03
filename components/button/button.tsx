/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import styles from './button.module.css';
import React from 'react';

function Button({ onClickAction, isGenerating, children }) {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={isGenerating ? `${styles.button} ${styles.loading}` : styles.button}
        onClick={onClickAction}
      >
        { isGenerating ? <span className={styles.loader} /> : children }
      </button>
    </div>
  );
}

Button.propTypes = {
  onClickAction: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;
