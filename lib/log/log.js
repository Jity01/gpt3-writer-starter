import styles from './log.module.css';
import months from '../../utils/constants/months';

function Log({ replyButton, deleteButton, numOfLogs, message, createdAt, isReply }) {
  const formateDate = (date) => {
    const year = date.substring(0, 4);
    const month = months[date.substring(5, 7)];
    const day = date.substring(8, 10).substring(0, 1) === '0'
      ? date.substring(8, 10).substring(1, 2)
      : date.substring(8, 10);
    const formattedDate = `${month} ${day}, ${year}`;
    return formattedDate;
  };
  return (
    <div className={isReply ? `${styles.container} ${styles.isReply}` : styles.container }>
      { replyButton }
      <p>{message}</p>
      <div className={styles.subInfo}>
        <p>🪵 log #{numOfLogs}</p>
        <p>⏳ created at: {formateDate(createdAt)}</p>
        { deleteButton }
      </div>
    </div>
  );
}

export default Log;
