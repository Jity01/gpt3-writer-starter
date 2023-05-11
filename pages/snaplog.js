import LogBox from "../lib/log-box/log-box";
import { useState, useRef } from "react";
import {
  addLog,
  getUserId,
  getLogsByUserId,
  deleteLog,
  addReplyToLog,
  resetReplyLogId,
} from "../utils/client/db-helpers";
import Button from "../lib/button/button";
import LittleButton from "../lib/little-button/little-button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../lib/root/root";
import Log from "../lib/log/log";

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop)  

function SnapLog({ userId, logs }) {
  const [logMessage, setlogMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatedLogs, setUpdatedLogs] = useState([...logs]);
  const [replyMode, setReplyMode] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [idOfLogToReplyTo, setIdOfLogToReplyTo] = useState(null);
  const myRef = useRef(null)
  const executeScroll = () => scrollToRef(myRef)
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
  return (
    <Root>
      <h1>snaplog</h1>
        <LogBox
          button={
            replyMode
            ?
              <>
                <Button onClickAction={closeReply} isGenerating={isGenerating}>reply</Button>
                <Button onClickAction={cancelReply}>cancel</Button>
              </>
            : <Button onClickAction={handleLog} isGenerating={isGenerating}>log</Button>
        }>
          <textarea
            placeholder={replyMode ? "what do wanna reply w?" : "what are u thinking abt?"}
            value={replyMode ? replyMessage : logMessage}
            onChange={replyMode ? (e) => setReplyMessage(e.target.value) : (e) => setlogMessage(e.target.value)}
            ref={myRef}
          />
        </LogBox>
        {
          updatedLogs && updatedLogs.slice(0).reverse().map((log, idx) => {
            return (
              <div key={log.id}>
                <Log
                  replyButton={<LittleButton onClickAction={() => openReply(log.id)}>🪃</LittleButton>}
                  deleteButton={<Button onClickAction={() => handleDelete(log.id)}>delete</Button>}
                  numOfLogs={updatedLogs.length - idx}
                  message={log.message}
                  createdAt={log.created_at}
                  isReply={log.is_reply}
                />
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
