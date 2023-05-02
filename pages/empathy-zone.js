import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { getEmpathyGeneration, createFullChatContext } from '../utils/client/prompt-helpers';
import { useState } from 'react';
import Title from '../lib/title/title';
import Head from 'next/head';
import Root from '../lib/root/root';
import LogBox from '../lib/log-box/log-box';
import LogBoxOutput from '../lib/log-box/log-box-output';
import Button from '../lib/button/button';

function EmpathyZone() {
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiOutput, setApiOutput] = useState('');

  const getResponse = async () => {
    setIsGenerating(true);
    const prompt = createFullChatContext(chat, userInput);
    const responseText = await getEmpathyGeneration(prompt);
    setIsGenerating(false);
    setApiOutput(responseText);
    setChat([...chat, { user: userInput, JEN: responseText }]);
    setUserInput('');
  };

  const reset = async () => {
    setChat([]);
  };

  return (
    <Root>
      <Head>
        <title>just zonenin :)</title>
      </Head>
      <Title
        title="emapthy zone 🫡"
        subtitle="write a sentence, get a paragraph."
      />
      <div>
        <LogBox>
            <textarea
              className="empathy-zone-textarea"
              placeholder="i feel paralyzed by my imperfections."
              input={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              />
        </LogBox>
        <Button onClickAction={getResponse} isGenerating={isGenerating}>jenerate</Button>
        <LogBoxOutput outputText={apiOutput} />
      </div>
    </Root>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: '/' } };
  }
  return { props: { session } };
}
  
export default EmpathyZone;