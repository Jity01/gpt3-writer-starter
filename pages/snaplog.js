import LogBox from "../lib/log-box/log-box";
import { useState } from "react";
import { addLog, getUserId, getLogsByUserId, deleteLog } from "../utils/client/db-helpers";
import Button from "../lib/button/button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../lib/root/root";
import Log from "../lib/log/log";

function SnapLog({ userId, logs }) {
  const [logMessage, setlogMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatedLogs, setUpdatedLogs] = useState([...logs]);
  const handleClick = async () => {
    if (userId) {
      setIsGenerating(true);
      await addLog(logMessage, userId);
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
      setIsGenerating(false);
    }
  };
  return (
    <Root>
      <h1>snaplog</h1>
        <LogBox
          button={
          <Button onClickAction={handleClick} isGenerating={isGenerating}>log</Button>
        }>
          <textarea
            className="empathy-zone-textarea"
            placeholder="whatcha thinkin?"
            input={logMessage}
            onChange={(e) => setlogMessage(e.target.value)}
          />
        </LogBox>
        {
          updatedLogs && updatedLogs.slice(0).reverse().map((log) => {
            return (
              <div key={log.id}>
                <Log id={log.id} message={log.message} createdAt={log.created_at}>
                  <Button onClickAction={() => handleDelete(log.id)}>delete</Button>
                </Log>
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
