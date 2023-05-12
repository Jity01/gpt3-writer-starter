/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Head from 'next/head';
import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import Title from '../lib/title/title';
import Root from '../lib/root/root';
import { getFittingPrinciple, createSearchContext } from '../utils/client/prompt-helpers';
import { useSpeechSynthesis } from 'react-speech-kit';
import Button from '../lib/button/button';
import {
  getUserId,
  getLogsByUserId
} from "../utils/client/db-helpers";

function Prompt({ userId }) {
  const [userInput, setUserInput] = useState('');
  const [apiOutput, setApiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    speak,
    cancel,
    speaking,
    supported,
    voices,
  } = useSpeechSynthesis();

  const playOutput = () => {
    if (supported) speak({ text: apiOutput, voice: voices[0] });
  };

  const callGenerateEndpoint = async () => {
    if (speaking) cancel();
    setIsGenerating(true);
    const logs = await getLogs();
    const searchContext = createSearchContext(logs, userInput);
    const text = await getFittingPrinciple(searchContext);
    setIsGenerating(false);
    setUserInput('');
    setApiOutput(text);
  };

  const getLogs = async () => {
    if (userId) {
      const logs = await getLogsByUserId(userId);
      return logs;
    }
    return [];
  };

  return (
    <Root>
      <Head>
        <title>textin jen :)</title>
      </Head>
      <Title
        title="reinforce ur shit."
        subtitle="it's so nice when you remember your principles, isn't it?"
      />
      <div className="prompt-container">
        <textarea
          placeholder="i feel like my work is not perfect. it's gotten so hard for me to keep creating."
          className="prompt-box"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button onClickAction={callGenerateEndpoint} isGenerating={isGenerating}>jenerate</Button>
        { apiOutput && (
          <div className="output">
            <div className="output-header-container">
              <div className="output-header">
                <h3>ur thoughts</h3>
                <button type="button" onClick={playOutput}>play them instead</button>
              </div>
            </div>
            <div className="output-content">
              <p>{apiOutput}</p>
            </div>
          </div>
        ) }
      </div>
    </Root>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  let userId = null;
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: '/' } };
  } else {
    const names = session.user.name.split(" ");
    userId = await getUserId(names[0], names[1], session.user.email);
  }
  return { props: { session, userId } };
}

export default Prompt;
