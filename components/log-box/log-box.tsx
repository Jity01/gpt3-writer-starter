import React from 'react';
import styles from './log-box.module.css';

function LogBox({ placeholder, value, onChange, button }) {
  const formatValue = (message: string) => {
    const messageArray = message.split(`\n`);
    const finalMessageChuncks: string[] = [];
    messageArray.forEach((chunck) => {
      finalMessageChuncks.push(chunck.replace(/<\/?strong>/g, '**'));
    });
    return finalMessageChuncks.join(`\n`);
  }
  return (
    <div className={styles.container}>
          <textarea
            placeholder={placeholder}
            value={formatValue(value)}
            onChange={onChange}
          />
        { button }
    </div>
  );
}

export default LogBox;