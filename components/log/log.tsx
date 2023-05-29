import styles from './log.module.css';
import months from '../../utils/constants/months.json';
import React from 'react';

function Log({ likeButton, replyButton, deleteButton, reply_log_id, numOfLogs, message, createdAt, isReply, dislikeButton }) {
  const formateDate = (date) => {
    const year = date.substring(0, 4);
    const month = months[date.substring(5, 7)];
    const day = date.substring(8, 10).substring(0, 1) === '0'
      ? date.substring(8, 10).substring(1, 2)
      : date.substring(8, 10);
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;
  };
  const formatMessage = (message: string) => {
    const trimmedMessage = message.split(`\n`);
    const messageDivs = trimmedMessage.map(chunck => {
     return (
        chunck.startsWith("**")
          ? (
              <p style={{ color: "hsl(126, 71%, 48%)"}}>
                <strong>{chunck.substring(2, chunck.length - 2)}</strong>
              </p>
            )
          : <p>{chunck}</p>
      );
  })
  return messageDivs;
};
  return (
    <div className={isReply ? `${styles.container} ${styles.isReply}` : styles.container }>
      <div className={styles.buttonContainer}>
        { replyButton }
        { likeButton }
        { dislikeButton }
      </div>
      <div>
        { formatMessage(message).map(messageDiv => messageDiv) }
      </div>
      <div className={styles.subInfo}>
        <p>🪵 log #{numOfLogs}</p>
        <p>⏳ created at: {formateDate(createdAt)}</p>
        { deleteButton }
      </div>
    </div>
  );
}

export default Log;
