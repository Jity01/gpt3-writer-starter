import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { getEmpathyGeneration, createFullChatContext } from '../utils/client/prompt-helpers';
import { useState, useEffect } from 'react';
import Title from '../lib/title/title';
import Button from '../lib/button/button';
import Link from 'next/link';
import Head from 'next/head';
import Root from '../lib/root/root';

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

  useEffect(() => {
    console.log('here');
  }, []);

  return (
    <Root>
      <Head>
        <title>just zonenin :)</title>
      </Head>
      <Title
        title="emapthy zone 🫡"
        subtitle="write a sentence, get a paragraph."
      />
      <div className="emapthy-zone-container">
        <div className="parallelogram">
          <textarea
            className="empathy-zone-textarea"
            placeholder="i feel paralyzed by my imperfections."
            input={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            />
        </div>
        <div className="prompt-buttons" style={{ marginTop: "10px" }}>
          <a
            className={isGenerating ? 'generate-button loading' : 'generate-button'}
            onClick={getResponse}
          >
            <div>
              { isGenerating ? <span className="loader" /> : <p>JENerate</p> }
            </div>
          </a>
        </div>
        <div className="empathy-zone-output-container">
          <h3 />
          <div className="parallelogram">
            <div className="empathy-zone-output-container">{apiOutput}</div>
          </div>
        </div>
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