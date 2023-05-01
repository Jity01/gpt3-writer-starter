import LogBox from "../lib/log-box/log-box";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { addLog, getUserId } from "../utils/client/db-helpers";
import Button from "../lib/button/button";

function SnapLog() {
  const [userInput, setUserInput] = useState('');
  const { data: session } = useSession();
  const names = session.user.name.split(" ");
  const userId = getUserId(names[0], names[1], session.user.email);
  const handleClick = () => {
    addLog(userInput, userId);
    setUserInput('');
  };
  return (
    <div>
      <h1>snaplog</h1>
        <LogBox>
            <textarea
                className="empathy-zone-textarea"
                placeholder="what are your thoughts?"
                input={userInput}
                onChange={(e) => setUserInput(e.target.value)}
            />
            <Button onClickAction={handleClick}>log</Button>
        </LogBox>
    </div>
  );
}

export default SnapLog;
