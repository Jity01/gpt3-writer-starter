import LogBox from "../lib/log-box/log-box";
import { useState, useRef } from "react";
import {
  addLog,
  getUserId,
  getLogsByUserId,
  deleteLog,
  addReplyToLog,
  resetReplyLogId,
  addWin,
} from "../utils/client/db-helpers";
import Button from "../lib/button/button";
import LittleButton from "../lib/little-button/little-button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../lib/root/root";
import Log from "../lib/log/log";
import Head from "next/head";
import Notification from "../lib/notification/notification";
import Input from '../lib/input/input'

function SnapLog({ userId, logs }) {
  const [logMessage, setlogMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatedLogs, setUpdatedLogs] = useState([...logs]);
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [idOfLogToReplyTo, setIdOfLogToReplyTo] = useState(null);
  const [win, setWin] = useState('');
  const myRef = useRef(null)
  const executeScroll = () => myRef.current.scrollIntoView();
  const handleLog = async () => {
    if (userId) {
      setIsGenerating(true);
      await addLog(logMessage, userId, false);
      setUpdatedLogs(await getLogsByUserId(userId));
      setlogMessage('');
      setIsGenerating(false);
    }
  };
  const handleDelete = async (logId) => {
    if (userId) {
      setIsGenerating(true);
      await deleteLog(logId);
      setUpdatedLogs(await getLogsByUserId(userId));
      updatedLogs.map(async (log) => {
        if (log.reply_log_id === logId) {
          await resetReplyLogId(log.id);
        }
      })
      setIsGenerating(false);
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
    setIsGenerating(true);
    const data = await addLog(replyMessage, userId, true);
    const replyLogId = data[0].id;
    await addReplyToLog(idOfLogToReplyTo, replyLogId);
    setUpdatedLogs(await getLogsByUserId(userId));
    setReplyMode(false);
    setReplyMessage('');
    setIdOfLogToReplyTo(null);
    setIsGenerating(false);
  };
  const cancelReply = () => {
    setReplyMode(false);
    setReplyMessage('');
    setIdOfLogToReplyTo(null);
  };
  const getParentMatches = () => {
    const parentMatches = updatedLogs.filter(log => log.is_reply === false);
    return parentMatches;
  };
  const getChildrenMatchesOfLog = (log) => {
    const childrenMatches = [];
    let currentLog = log;
    while (currentLog.reply_log_id) {
      const childMatch = updatedLogs.find(log => log.id === currentLog.reply_log_id);
      childrenMatches.push(childMatch);
      currentLog = childMatch;
    }
    return childrenMatches;
  };
  const addWinToLog = async (logId, currentWins) => {
    if (userId) {
      setIsGenerating(true);
      const updatedWins = currentWins ? [...currentWins, win] : [win];
      await addWin(logId, updatedWins);
      setUpdatedLogs(await getLogsByUserId(userId));
      setWin('');
      setIsGenerating(false);
    }
  };
  const deleteWinFromLog = async (logId, currentWins, winToDelete) => {
    if (userId) {
      setIsGenerating(true);
      const updatedWins = currentWins.filter(win => win !== winToDelete);
      await addWin(logId, updatedWins);
      setUpdatedLogs(await getLogsByUserId(userId));
      setIsGenerating(false);
    }
  };
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
                <Button onClickAction={closeReply} isGenerating={isGenerating}>reply</Button>
                <Button onClickAction={cancelReply}>cancel</Button>
              </>
            : <Button onClickAction={handleLog} isGenerating={isGenerating}>log</Button>
          }
        >
          <textarea
            placeholder={replyMode ? "what do wanna reply w?" : "what are u thinking abt?"}
            value={replyMode ? replyMessage : logMessage}
            onChange={replyMode ? (e) => setReplyMessage(e.target.value) : (e) => setlogMessage(e.target.value)}
          />
        </LogBox>
        {
          updatedLogs && getParentMatches().slice(0).reverse().map((log) => {
            return (
              <>
                <div key={log.id}>
                  <Log
                    replyButton={<LittleButton onClickAction={() => openReply(log.id)}>🪃</LittleButton>}
                    deleteButton={<Button onClickAction={() => handleDelete(log.id)}>delete</Button>}
                    numOfLogs={log.id}
                    message={log.message}
                    createdAt={log.created_at}
                    isReply={log.is_reply}
                  />
                </div>
                <div
                  key={log.id + 1}
                  style={{
                    padding: "20px 15px",
                    borderRadius: "10px",
                    boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.1)",
                  }}
                >
                  <Input
                    placeholder="🎉 add a win!"
                    value={win} 
                    onChangeAction={(e) => setWin(e.target.value)}
                  />
                  <LittleButton
                    onClickAction={() => addWinToLog(log.id, log.wins)}
                  >
                    add
                  </LittleButton>
                  {
                    log.wins && log.wins.map((winMessage) => {
                      return (
                        <Notification>
                          { winMessage }
                          <LittleButton
                            onClickAction={
                              () => deleteWinFromLog(log.id, log.wins, winMessage)
                            }
                          >
                              🗑
                          </LittleButton>
                        </Notification> 
                      )
                    })
                  }
                </div>
                <div key={log.id + 2}>
                  {
                    getChildrenMatchesOfLog(log).map((childLog) => {
                      return (
                        <Log
                          key={childLog.id}
                          replyButton={<LittleButton onClickAction={() => openReply(childLog.id)}>🪃</LittleButton>}
                          deleteButton={<Button onClickAction={() => handleDelete(childLog.id)}>delete</Button>}
                          numOfLogs={childLog.id}
                          message={childLog.message}
                          createdAt={childLog.created_at}
                          isReply={childLog.is_reply}
                        />
                      )
                    })
                  }
                </div>
              </> 
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
