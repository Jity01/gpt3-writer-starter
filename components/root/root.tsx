import React from "react";
import styles from './root.module.css';

function Root({ children, isSearching }) {
    return <div className={isSearching ? `${styles.container} ${styles.isSearching}` : styles.container}>{ children }</div>;
}

export default Root;
