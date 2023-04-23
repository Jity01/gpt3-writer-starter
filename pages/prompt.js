/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Head from 'next/head';
import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import Title from '../lib/title/title';
import Root from '../lib/root/root';
import { getAdviceGeneration } from '../utils/client/prompt-helpers';
import { useSpeechSynthesis } from 'react-speech-kit';

function Prompt() {
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
    const text = await getAdviceGeneration(userInput);
    setIsGenerating(false);
    setApiOutput(text);
  };

  return (
    <Root>
      <Head>
        <title>textin jen :)</title>
      </Head>
      <Title
        title="reinforce ur shit."
        subtitle="it's so hard to remember ur principles. let JEN help with that."
      />
      <div className="prompt-container">
        <textarea
          placeholder="i feel like my work is not perfect. it's gotten so hard for me to keep creating."
          className="prompt-box"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <div className="prompt-buttons">
          <a
            className={isGenerating ? 'generate-button loading' : 'generate-button'}
            onClick={callGenerateEndpoint}
          >
            <div>
              { isGenerating ? <span className="loader" /> : <p>JENerate</p> }
            </div>
          </a>
        </div>

        { apiOutput && (
          <div className="output">
            <div className="output-header-container">
              <div className="output-header">
                <h3>here&apos;s what i think</h3>
                <button type="button" onClick={playOutput}>play my thoughts</button>
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
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return { redirect: { destination: '/' } };
  }
  return { props: { session } };
}

export default Prompt;
