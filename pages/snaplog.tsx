import LogBox from "../components/log-box/log-box";
import { useState, useEffect, useRef } from "react";
import {
  addLog,
  getUserId,
  getLogsByUserId,
  deleteLog,
  addReplyToLog,
  resetReplyLogId,
  addLike,
} from "../utils/client/db-helpers";
import Button from "../components/button/button";
import LittleButton from "../components/little-button/little-button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../components/root/root";
import Log from "../components/log/log";
import Head from "next/head";
import { getGeneration, createPromptContext } from "../utils/client/prompt-helpers";

function SnapLog({ userId, logs }) {
  const [logMessage, setlogMessage] = useState(``);
  const [isGenerating, setIsGenerating] = useState({ addLog: false, deleteLog: false, addLike: false });
  const [updatedLogs, setUpdatedLogs] = useState([...logs]);
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState(``);
  const [idOfLogToReplyTo, setIdOfLogToReplyTo] = useState(null);
  const myRef = useRef(null)
  const executeScroll = () => myRef.current.scrollIntoView();
  const handleLog = async () => {
    if (userId) {
      setIsGenerating({ ...isGenerating, addLog: true});
      await addLog(logMessage, userId, false);
      setUpdatedLogs(await getLogsByUserId(userId));
      setlogMessage(``);
      setIsGenerating({ ...isGenerating, addLog: false});
    }
  };
  const handleDelete = async (logId) => {
    if (userId) {
      setIsGenerating({ ...isGenerating, deleteLog: true});
      await deleteLog(userId, logId);
      setUpdatedLogs(await getLogsByUserId(userId));
      updatedLogs.map(async (log) => {
        if (log.reply_log_id === logId) {
          await resetReplyLogId(log.id);
        }
      })
      setIsGenerating({ ...isGenerating, deleteLog: false});
    }
  };
  const openReply = (logId) => {
    if (userId) {
      executeScroll();
      setReplyMode(true);
      setIdOfLogToReplyTo(logId);
    }
  };
  const closeReply = async () => {
    setIsGenerating({ ...isGenerating, addLog: true });
    const id = await addLog(replyMessage, userId, true);
    const replyLogId = id;
    await addReplyToLog(idOfLogToReplyTo, replyLogId);
    setUpdatedLogs(await getLogsByUserId(userId));
    setReplyMode(false);
    setReplyMessage(``);
    setIdOfLogToReplyTo(null);
    setIsGenerating({ ...isGenerating, addLog: false });
  };
  const cancelReply = () => {
    setReplyMode(false);
    setReplyMessage(``);
    setIdOfLogToReplyTo(null);
  };
  const getParentMatches = () => {
    const parentMatches = updatedLogs.filter(log => log.is_reply === false);
    return parentMatches;
  };
  const getChildrenMatchesOfLog = (log) => {
    const childrenMatches = [];
    let currentLog = log;
    while (currentLog && currentLog.reply_log_id) {
      const childMatch = updatedLogs.find(log => log.id === currentLog.reply_log_id);
      childrenMatches.push(childMatch);
      currentLog = childMatch;
    }
    return childrenMatches;
  };
  const addLikeToLog = async (logId: number, currentLikes: number) => {
    if (userId) {
      setIsGenerating({ ...isGenerating, addLike: true });
      const updatedLikes = currentLikes + 1;
      await addLike(logId, updatedLikes);
      setUpdatedLogs(await getLogsByUserId(userId));
      setIsGenerating({ ...isGenerating, addLike: false });
    }
  };
  const generateQuestion = async (message, setMessage) => {
    setIsGenerating({ ...isGenerating, addLog: true });
    const promptWithContext = createPromptContext(message.slice(0, -3));
    const generatedQuestion = await getGeneration(promptWithContext);
    const questionToInsert = `<strong>${generatedQuestion.replace(/^\n+|\n+$/g, '').replace("<strong>", "").replace("</strong>").replace("*", "")}</strong>`;
    setMessage(`${message.slice(0, -2)}\n${questionToInsert}\n`);
    setIsGenerating({ ...isGenerating, addLog: false });
  };
  useEffect(() => {
    if (!replyMode) {
      if (logMessage.slice(-3, logMessage.length) === "\n\n\n") {
        generateQuestion(logMessage, setlogMessage).then();
      }
    }
  }, [logMessage]);
  useEffect(() => {
    if (replyMode) {
      if (replyMessage.slice(-3, replyMessage.length) === "\n\n\n") {
        generateQuestion(replyMessage, setReplyMessage).then();
      }
    }
  }, [replyMessage])
  return (
    <Root>
      <Head>
        <title>snaplog</title>
      </Head>
      <h1 ref={myRef}>snaplog</h1>
        <LogBox
          button={
            replyMode
            ?
              <>
                <Button onClickAction={closeReply} isGenerating={isGenerating.addLog}>reply</Button>
                <Button onClickAction={cancelReply} isGenerating={false}>cancel</Button>
              </>
            : <Button onClickAction={handleLog} isGenerating={isGenerating.addLog}>log</Button>
          }
          placeholder={replyMode ? "reply here" : "what are u thinking abt?"}
          value={replyMode ? replyMessage : logMessage}
          onChange={replyMode ? (e) => setReplyMessage(`${e.target.value}`) : (e) => setlogMessage(`${e.target.value}`)}
        />
        {
          updatedLogs && getParentMatches().slice(0).sort((a, b) => (a.id > b.id ? 1 : -1)).reverse().map((log, logIdx) => {
            return (
              <div key={log.id - 1}>
                <div key={log.id}>
                  <Log
                    likeButton={
                      (<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                        <LittleButton
                          onClickAction={() => addLikeToLog(log.id, log.num_of_likes)}
                          isGenerating={false}
                          mute={false}>
                          <> 
                          { log.num_of_likes !== 0 && <span style={{ marginRight: "2px"}}>{log.num_of_likes}</span> }
                          ♡
                          </>
                        </LittleButton>
                      </div>)
                    }
                    replyButton={<LittleButton onClickAction={() => openReply(log.id)} isGenerating={false} mute={log.reply_log_id}>🪃</LittleButton>}
                    deleteButton={<Button onClickAction={() => handleDelete(log.id)} isGenerating={isGenerating.deleteLog}>delete</Button>}
                    numOfLogs={getParentMatches().length - (logIdx)}
                    message={log.message}
                    createdAt={log.created_at}
                    isReply={log.is_reply}
                    reply_log_id={log.reply_log_id}
                  />
                </div>
                <div key={log.id + 1}>
                  {
                    getChildrenMatchesOfLog(log).map((childLog, childLogIdx) => {
                      return (
                        childLog 
                          ? <Log
                              key={childLog.id}
                              likeButton={
                                <LittleButton onClickAction={() => addLikeToLog(childLog.id, childLog.num_of_likes)} isGenerating={false} mute={false}>
                                  <> 
                                    { childLog.num_of_likes !== 0 && <span style={{ marginRight: "2px"}}>{childLog.num_of_likes}</span> }
                                    ♡
                                  </>
                                </LittleButton>
                              }
                              replyButton={<LittleButton onClickAction={() => openReply(childLog.id)} isGenerating={false} mute={childLog.reply_log_id}>🪃</LittleButton>}
                              deleteButton={<Button onClickAction={() => handleDelete(childLog.id)} isGenerating={isGenerating.deleteLog}>delete</Button>}
                              numOfLogs={`${getParentMatches().length - logIdx}.${childLogIdx + 1}`}
                              message={childLog.message}
                              createdAt={childLog.created_at}
                              isReply={childLog.is_reply}
                              reply_log_id={childLog.reply_log_id}
                            />
                          : null
                      )
                    })
                  }
                </div>
              </div> 
          )})
        }
    </Root>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  let userId = null;
  let logs = null;
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: '/' } };
  } else {
    const names = session.user.name.split(" ");
    userId = await getUserId(names[0], names[1], session.user.email);
    logs = await getLogsByUserId(userId);
  }
  return { props: { session, userId, logs } };
}

export default SnapLog;
