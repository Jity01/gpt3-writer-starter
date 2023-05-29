import PropTypes from 'prop-types';
import styles from './root.module.css';
import React from 'react';

function Root({ children }) {
  return <div className={styles.root}>{ children }</div>;
}

export default Root;
