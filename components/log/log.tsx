import styles from './log.module.css';
import months from '../../utils/constants/months.json';
import React, { useState } from 'react';
import { BsPlay } from 'react-icons/bs';

function Log({
  musicLink,
  replyRef,
  isSearching,
  imgURL,
  logMark,
  talkMessage,
  setTalkMessage,
  choseValueToTalkTo,
  talkMode,
  replyButton,
  deleteButton,
  talkButton,
  reply_log_id,
  numOfLogs,
  message,
  createdAt,
  isReply,
  dislikeButton,
  editButton,
  editMode,
  editMessage,
  setEditMessage,
  editLogId,
  logId,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
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
    const trimmedMessage = message.toLowerCase().split(`\n`);
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
  };
  const generateContainerClass = () => {
    if (isReply && musicLink && !isPlaying) return `${styles.container} ${styles.isReply} ${styles.hasMusic}`;
    if (isReply) return `${styles.container} ${styles.isReply}`;
    if (musicLink && !isPlaying) return `${styles.container} ${styles.hasMusic}`;
    return styles.container;
  };
  const generatePlayButtonClass = () => {
    if (!isPlaying && musicLink) return `${styles.playButton} ${styles.hasMusic}`;
    return styles.playButton;
  };
  return (
    <div ref={replyRef} className={generateContainerClass()}>
      { musicLink && <BsPlay size="45px" className={generatePlayButtonClass()} onClick={() => setIsPlaying(!isPlaying)} /> }
      { talkMode && choseValueToTalkTo.includes(message.toLowerCase()) && !isReply ? (
        <>
          <div className={`${styles.singularButton} ${styles.buttonContainer}`}>
            { talkButton }
          </div>
          <textarea
            className={styles.textarea}
            style={isReply ? window.innerWidth < 600 ? { minWidth: "190px", maxWidth: "190px" } : { minWidth: "221px", maxWidth: "221px" } : {}}
            value={formatValue(talkMessage.message)}
            onChange={(e) => setTalkMessage({ ...talkMessage, message: e.target.value.toLowerCase() })}
            placeholder='talk to me :)'
          />
        </>
      ) : talkMode && choseValueToTalkTo.includes(message.toLowerCase()) && isReply
            ? null
            : editMode && editLogId === logId
              ? (
                <>
                  { talkButton }
                  <div className={styles.subInfo}>
                    <p>🪵 {logMark} #{numOfLogs}</p>
                    <p>⏳ created at: {formateDate(createdAt)}</p>
                    <hr />
                  </div>
                  { isPlaying && musicLink &&
                    <>
                      <br />
                      <iframe
                        height={"300"}
                        src={musicLink}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        frameBorder="0"
                      />
                    </> }
                  <div>
                    <textarea
                      className={styles.textarea}
                      style={isReply ? window.innerWidth < 600 ? { minWidth: "190px", maxWidth: "190px" } : { minWidth: "221px", maxWidth: "221px" } : {}}
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value.toLowerCase())}
                      placeholder='edit me :)'
                    />
                  </div>
                  { imgURL && <img src={imgURL} alt={`generated img for log with message of ${message}`} /> }
                  <div>
                    <hr />
                  </div>
                  <div className={styles.buttonContainer}>
                    { replyButton }
                    { editButton }
                    { deleteButton }
                    { dislikeButton }
                  </div>
                </>
              )
              : (
                <>
                  { talkButton }
                  <div className={styles.subInfo}>
                    <p>🪵 {logMark} #{numOfLogs}</p>
                    <p>⏳ created at: {formateDate(createdAt)}</p>
                    <hr />
                  </div>
                  { isPlaying && musicLink &&
                    <>
                      <br />
                      <iframe
                        height={"300"}
                        src={musicLink}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        frameBorder="0"
                      />
                    </> }
                  <div>
                    { formatMessage(message).map(messageDiv => messageDiv) }
                  </div>
                  { imgURL && <img src={imgURL} alt={`generated img for log with message of ${message}`} /> }
                  <div>
                    <hr />
                  </div>
                  <div className={styles.buttonContainer}>
                    { replyButton }
                    { editButton }
                    { deleteButton }
                    { dislikeButton }
                  </div>
                </>
              )
    }
    </div>
  );
}

export default Log;
