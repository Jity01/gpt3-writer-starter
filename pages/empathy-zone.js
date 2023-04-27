import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { getEmpathyGeneration } from '../utils/client/prompt-helpers';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useState, useEffect } from 'react';
import Title from '../lib/title/title';
import Button from '../lib/button/button';
import Link from 'next/link';
import Head from 'next/head';

function EmpathyZone() {
  const [chat, setChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
      speak,
      cancel,
      supported,
    } = useSpeechSynthesis();

  const getResponse = async () => {
    setIsGenerating(true);
    const prompt = createFullChatContext(chat, transcript);
    const responseText = await getEmpathyGeneration(prompt);
    setIsGenerating(false);
    setChat([...chat, { user: userInput, JEN: responseText }]);
  };

  const reset = async () => {
    setChat([]);
    await cancel();
  };

  const playOutput = (text) => {
    speak({ text });
  };

  useEffect(() => {
    console.log('here');
  }, []);

  // if (!supported) {
  //   return (
  //     <>
  //       <p>
  //         your browser does not support this feature.
  //       </p>
  //       <p>
  //         if possible, i recommend trying google chrome!
  //       </p>
  //     </>
  //   );
  // }

  return (
    <div className="empathy-zone-page">
      <Head>
        <title>just zonenin :)</title>
      </Head>
      <Title
        title="emapthy zone 🫡"
        subtitle="don't you ever feel like screaming, 'hello?? is there anyone who understands me??'"
      />
      {
        chat.map((el) => {
          return (
            <>
              <div className="emapthy-zone-container">
                <div className="parallelogram">
                  <textarea
                    className="empathy-zone-textarea"
                    placeholder="i feel paralyzed by my imperfections."
                    input={el.user}
                    disabled />
                </div>
              </div>
              <div className="empathy-zone-output-container">
                <Button onClickAction={() => playOutput(el.JEN)}>play my thoughts :)</Button>
                <div className="parallelogram">
                  <div>{el.JEN}</div>
                </div>
              </div>
            </>
          );
        })
      }
      {
        isGenerating
          ? <p>hmm...</p>
          : (
              <div className="emapthy-zone-container">
                <div className="parallelogram">
                  <textarea
                    className="empathy-zone-textarea"
                    placeholder="i feel paralyzed by my imperfections."
                    input={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    />
                </div>
                <Button onClickAction={getResponse}>JENerate</Button>
              </div>
            )
      }
      <Link href="/dashboard">
        <div style={{ width: '300px' }}>
          <Button onClickAction={reset}>back to dashboard!</Button>
        </div>
      </Link>
    </div>
  );
}

// export async function getServerSideProps(context) {
//   const { req, res } = context;
//   const session = await getServerSession(req, res, authOptions);
//   if (!session) {
//     return { redirect: { destination: '/' } };
//   }
//   return { props: { session } };
// }
  
export default EmpathyZone;