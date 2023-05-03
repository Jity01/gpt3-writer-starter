import LogBox from "../lib/log-box/log-box";
import { useState } from "react";
import { addLog, getUserId, getLogsByUserId } from "../utils/client/db-helpers";
import Button from "../lib/button/button";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Root from "../lib/root/root";
import Log from "../lib/log/log";

function SnapLog({ userId, logs }) {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updatedLogs, setUpdatedLogs] = useState([...logs]);
  const handleClick = async () => {
    if (userId) {
      setIsGenerating(true);
      await addLog(userInput, userId);
      setUpdatedLogs(await getLogsByUserId(userId));
      setUserInput('');
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
            input={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
        </LogBox>
        {
          updatedLogs && updatedLogs.slice(0).reverse().map((log) => {
            return (
              <Log key={log.id} id={log.id} message={log.message} createdAt={log.created_at} />
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
