/* eslint-disable import/no-extraneous-dependencies */
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Button from '../lib/button/button';
import { getConversationGeneration, createFullChatContext } from '../utils/client/prompt-helpers';
import { useSpeechSynthesis } from 'react-speech-kit';
import Layout from '../lib/layout/layout';
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import Title from '../lib/title/title';
import Root from '../lib/root/root';
import Link from 'next/link';
import Head from 'next/head';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

const appId = '703efb7d-6930-4a9e-b71c-2282c3d7d145';
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

// todo: add a place where the user can input how they felt about the session (abstract textarea?)
// todo: insert session into database

function AudioCall() {
  const [chat, setChat] = useState([]);
  const [conversationStatus, setConversationStatus] = useState('not-started');
  const [stopListeningFlag, setStopListeningFlag] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  const {
      speak,
      cancel,
      speaking,
      supported,
      voices,
    } = useSpeechSynthesis();
  const listenContinuously = async () => {
    if (speaking) await cancel();
    SpeechRecognition.startListening({ continuous: true });
  }
  const [voiceIndex, setVoiceIndex] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const voice = voices[voiceIndex] || null;

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    if (transcript) await getResponse();
  };

  const getResponse = async () => {
    setIsGenerating(true);
    const prompt = createFullChatContext(chat, transcript);
    const responseText = await getConversationGeneration(prompt);
    setIsGenerating(false);
    speak({ text: responseText, voice, rate, pitch });
    setChat([...chat, { user: transcript, JEN: responseText }]);
    resetTranscript();
  };

  const endCall = async () => {
    setConversationStatus('closed');
    setChat([]);
    resetTranscript();
    SpeechRecognition.stopListening();
    await cancel();
    // const sessionChat = createFullChatContext(chat, transcript);
    // await insertAudioSessionIntoDB({sessionChat});
  };
  
  useEffect(() => {
    const handleDown = (e) => {
      if (e.code === 'Space') {
        setStopListeningFlag(false);
        listenContinuously();
      } else if (e.code === 'Enter') {
        resetTranscript();
      } else if (e.key === 'Backspace') {
        console.log('about to cancel')
        cancel();
      }
    };
    const handleUp = async (e) => {
      if (e.code === 'Space') setStopListeningFlag(true);
    };
    document.addEventListener('keydown', handleDown)
    document.addEventListener('keyup', handleUp)
    return () => {
      document.removeEventListener('keydown', handleDown);
      document.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    if (stopListeningFlag) stopListening();
  }, [stopListeningFlag]);

  if (!browserSupportsSpeechRecognition || !supported) {
    return (
      <>
        <p>
          your browser does not support this feature.
        </p>
        <p>
          if possible, i recommend trying google chrome!
        </p>
      </>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <>
        <p>
          your browser does not have access to your microphone :(
        </p>
        <p>
          please check your browser settings and try again!
        </p>
      </>
    );
  }

  return (
    <Root>
      <Head>
        <title>audio call</title>
      </Head>
      {
        conversationStatus === 'open'
          ? ( <>
               {
                isSettingsOpen ? (
                <div style={{ position: 'absolute', left: '0', top: '-12px', padding: '20px' }}>
                    <div style={{ maxWidth: '200px' }}>
                      <Button onClickAction={() => setIsSettingsOpen(false)}>settings</Button>
                    </div>
                    <div>
                      tips:
                      <ul>
                        <li>hold spacebar to speak</li>
                        <li>click enter to clear ur speech</li>
                      </ul>
                    </div>
                    <div>
                      <label><strong>jen&apos;s voice: </strong></label>
                      <select
                        value={voiceIndex || ''}
                        onChange={(event) => {
                          setVoiceIndex(event.target.value);
                        }}
                        style={{
                          fontSize: '14px',
                          maxWidth: '200px',
                        }}>
                        <option value="">default</option>
                        {voices.map((option, index) => (
                          <option key={option.voiceURI} value={index}>
                            {`${option.lang.toLowerCase()} - ${option.name.toLowerCase()}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label><strong>jen&apos;s rate: </strong></label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        defaultValue="1"
                        step="0.1"
                        id="rate"
                        onChange={(event) => {
                          setRate(event.target.value);
                        }}
                        style={{ height: '20px' }}
                      />
                    </div>
                    <div>
                      <label><strong>jen&apos;s pitch: </strong></label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        defaultValue="1"
                        step="0.1"
                        id="pitch"
                        onChange={(event) => {
                          setPitch(event.target.value);
                        }}
                      />
                    </div>
                  </div>
                )
                : (
                    <div style={{ position: 'absolute', left: '0', top: '-12px', maxWidth: '200px' }}>
                      <Button onClickAction={() => setIsSettingsOpen(true)}>settings</Button>
                    </div>
                  )
              }
                <Title title="transcript" subtitle="hold the spacebar to start speaking!" />
                <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginTop: '-10px'}}>
                  { chat.length
                    ? chat.map((el) => (
                        <>
                          <p><strong>you:</strong> { el.user }</p>
                          <p><strong>jen:</strong> { el.JEN }</p>             
                        </>
                      ))
                      : null }
                  { listening ? <p>you: { transcript }</p> : null }
                  { isGenerating ? <p>hmm...interesting - let me think about it.</p> : null }
                  <div style={{ width: '200px' }}><Button onClickAction={endCall}>end call</Button></div>
                </div> 
              </> )
          : conversationStatus === 'closed'
            ? ( <Layout>
                  <h2>thanks for today&apos;s great session :)</h2>
                  <p>you can see this session again in ur bookmarks.</p>
                  <Link href="/dashboard">
                    <div style={{ width: '400px'}}>
                      <Button onClickAction={() => {}}>back to home</Button>
                    </div>
                  </Link>
                  <Button onClickAction={() => setConversationStatus('open')}>call again!</Button>
                </Layout> )
            : ( <Layout>
                <h2>audio call w jen :)</h2>
                <h4>excited for today&apos;s session? call away!</h4>
                <Button onClickAction={() => setConversationStatus('open')}>open call</Button>
              </Layout> )
        }
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

export default AudioCall;
