import styles from './log.module.css';
import months from '../../utils/constants/months.json';
import React from 'react';

function Log({ replyRef, isSearching, imgURL, logMark, talkMessage, setTalkMessage, choseValueToTalkTo, talkMode, likeButton, replyButton, deleteButton, talkButton, reply_log_id, numOfLogs, message, createdAt, isReply, dislikeButton }) {
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
    });
    return messageDivs;
  };
  const formatValue = (message: string) => {
    const messageArray = message.split(`\n`);
    const finalMessageChuncks: string[] = [];
    messageArray.forEach((chunck) => {
      finalMessageChuncks.push(chunck.replace(/<\/?strong>/g, '**'));
    });
    return finalMessageChuncks.join(`\n`);
  }
  return (
    <div ref={replyRef} className={isReply ? `${styles.container} ${styles.isReply}` : styles.container }>
      { talkMode && choseValueToTalkTo.includes(message) ? (
        <>
          <textarea
            className={styles.textarea}
            style={isReply ? window.innerWidth < 600 ? { minWidth: "190px", maxWidth: "190px" } : { minWidth: "221px", maxWidth: "221px" } : {}}
            value={formatValue(talkMessage.message)}
            onChange={(e) => setTalkMessage({ ...talkMessage, message: e.target.value })}
            placeholder={'talk to me :)'}
          />
          <div className={`${styles.singularButton} ${styles.buttonContainer}`}>
            { talkButton }
          </div>
        </>
      ) :
      <>
        <div className={styles.buttonContainer}>
          { replyButton }
          { likeButton }
          { deleteButton }
          { dislikeButton }
        </div>
        <div>
          { formatMessage(message).map(messageDiv => messageDiv) }
        </div>
        { imgURL && <img src={imgURL} alt={`generated img for log with message of ${message}`} /> } 
        <div className={styles.subInfo}>
          <p>🪵 {logMark} #{numOfLogs}</p>
          <p>⏳ created at: {formateDate(createdAt)}</p>
          { talkButton }
        </div>
      </>
    }
    </div>
  );
}

export default Log;
