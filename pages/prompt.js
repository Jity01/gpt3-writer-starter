/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Head from 'next/head';
import { useState } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import Title from '../lib/title/title';
import Root from '../lib/root/root';
import Button from '../lib/button/button';
import {
  getUserId,
  getLogsByUserId,
  queryVectorDB
} from "../utils/client/db-helpers";
import { insertLogsIntoVectorDB } from '../utils/api/insert-logs-into-vector-db';
import { fetchVector } from '../utils/api/fetch-vector';

function Prompt({ userId }) {
  const [userInput, setUserInput] = useState('');
  const [matches, setMatches] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    const matches = await queryVectorDB(userId, userInput);
    setMatches(matches);
    setIsGenerating(false);
    setUserInput('');
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
          placeholder="i feel like my work is not perfect. it's gotten so hard for me to keep creating."
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
                matches.map((match, idx) => {
                  return (
                    <div
                      style={{
                        maxWidth: '500px',
                        padding: '10px',
                        margin: '5px',
                        border: '4px solid hsl(350, 100%, 84%)'
                      }}
                    >
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

const addMissingVectorsIntoDB = async (userId, logs) => {
  const idsOfLogs = logs.map((log) => log.id.toString());
  const vectorsInDB = await fetchVector(userId, idsOfLogs);
  const logsToInsertIntoVectorDB = logs.filter(log => {
    if (vectorsInDB.vectors[log.id]) return false;
    return true;
  });
  await insertLogsIntoVectorDB(userId, logsToInsertIntoVectorDB);
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
    await addMissingVectorsIntoDB(userId, logs);
  }
  return { props: { session, userId } };
}

export default Prompt;
