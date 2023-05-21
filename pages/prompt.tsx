/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Head from 'next/head';
import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import Title from '../components/title/title';
import Root from '../components/root/root';
import Button from '../components/button/button';
import {
  getUserId,
  // getLogsByUserId,
  queryVectorDB,
  insertInputIntoFeedbackDB,
  queryFeedbackVectorDB,
  updateFeedbackInput
} from "../utils/client/db-helpers";
import LittleButton from '@/components/little-button/little-button';
import { stringifyOutputEmbeddings, unstringifyOutputEmbeddings } from '../utils/api/output-stringifier';

function Prompt({ userId }) {
  const [userInput, setUserInput] = useState('');
  const [matches, setMatches] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputVector, setInputVector] = useState(null);

  const customIncludes = (arr, val) => {
    for (let i = 0; i < arr.length; i++) {
      let counter = 0;
      for (let j = 0; j < arr[i].length; j++) {
        if (arr[i][j] === val[j]) counter++;
      }
      if (counter === arr[i].length) return true;
    }
    return false;
  }

  const customEquals = (arr1, arr2) => {
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    const data = await queryVectorDB(userId, userInput);
    const inputData = await queryFeedbackVectorDB(userId, data.inputVector)
    if (inputData.match) {
      const outputs = [];
      for (let i = 0; i < inputData.match.metadata.outputs.length; i++) {
        outputs.push(unstringifyOutputEmbeddings(inputData.match.metadata.outputs[i]));
      }
      setMatches(data.scoredVectors.filter(m => !customIncludes(outputs, m.values)));
    } else {
      setMatches(data.scoredVectors);
    }
    setIsGenerating(false);
    setInputVector(data.inputVector);
    setUserInput('');
  };

  const handleDislike = async (match) => {
    // TODO: turn match to matches (handle general inputs of this type)
    setIsGenerating(true);
    const outputString = stringifyOutputEmbeddings(match.values);
    const data = await queryFeedbackVectorDB(userId, inputVector);
    if (!data.match) {
      await insertInputIntoFeedbackDB(userId, inputVector, [outputString]);
    } else {
      const { outputs } = data.match.metadata as { outputs: string[] };
      await updateFeedbackInput(userId, data.match.id, [...outputs, outputString]);
    }
    setIsGenerating(false);
    const newMatches = matches.filter((m) => !customEquals(match.values, m.values));
    setMatches(newMatches);
  };

  return (
    <Root>
      <Head>
        <title>textin jen :)</title>
      </Head>
      <Title
        title="search your thoughts."
        subtitle="it's so nice when you remember your principles, isn't it?"
      />
      <div className="prompt-container">
        <textarea
          placeholder="i feel like my work is not perfect - it's gotten so hard for me to keep creating."
          className="prompt-box"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button onClickAction={callGenerateEndpoint} isGenerating={isGenerating}>search!</Button>
        { matches && (
          <div className="output">
            <div className="output-header-container">
              <div className="output-header">
                <br />
              </div>
            </div>
            <div className="output-content">
              {
                matches.slice(0,3).map((match, idx) => {
                  return (
                    <div
                      style={{
                        maxWidth: '500px',
                        padding: '10px',
                        margin: '5px',
                        border: '4px solid hsl(350, 100%, 84%)'
                      }}
                      key={match.id}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end'
                        }}>
                        <LittleButton isGenerating={isGenerating} onClickAction={() => handleDislike(match)}>👎</LittleButton>
                      </div>
                      <p><h3>~~match #{idx + 1}~~</h3></p>
                      <p
                        style={{
                          color: 'purple',
                          fontSize: '0.9rem'
                        }}
                      >
                        search score: { Math.trunc((match.score.toFixed(3) * 100) * 100) / 100}%
                      </p>
                      <p>{ match.metadata.logMessage }</p>
                    </div>
                  );
                })
              }
            </div>
          </div>
        ) }
      </div>
    </Root>
  );
}

// const addMissingVectorsIntoDB = async (userId, logs) => {
//   const idsOfLogs = logs.map((log) => log.id.toString());
//   const vectorsInDB = await fetchVector(userId, idsOfLogs);
//   const logsToInsertIntoVectorDB = logs.filter(log => {
//     if (vectorsInDB.vectors[log.id]) return false;
//     return true;
//   });
//   await insertLogsIntoVectorDB(userId, logsToInsertIntoVectorDB);
// }

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
  //   logs = await getLogsByUserId(userId);
  //   await addMissingVectorsIntoDB(userId, logs);
  }
  return { props: { session, userId } };
}

export default Prompt;
