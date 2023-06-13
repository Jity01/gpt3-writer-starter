import React from 'react';
import styles from './log-box.module.css';

function LogBox({ placeholder, value, onChange, button, children }) {
  const formatValue = (message: string) => {
    const messageArray = message.split(`\n`);
    const finalMessageChuncks: string[] = [];
    messageArray.forEach((chunck) => {
      finalMessageChuncks.push(chunck.replace(/<\/?strong>/g, '**'));
    });
    return finalMessageChuncks.join(`\n`);
  };
  return (
    <div className={styles.container}>
      <br />
      <textarea
        placeholder={placeholder}
        value={formatValue(value)}
        onChange={onChange}
      />
      <div className={styles.toolBox}>
        { button }
      </div>
      <br />
      <br />
      { children }
    </div>
  );
}

export default LogBox;