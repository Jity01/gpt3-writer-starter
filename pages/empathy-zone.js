import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import TextCloud from '../lib/text-cloud/text-cloud';
import Layout from '../lib/layout/layout';
import { getAdviceGeneration } from '../utils/client/prompt-helpers';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useState } from 'react';

function EmpathyZone() {
    // array of objects holding all of the empathies generated along with their prompts
    const [sessions, setSessions] = useState([]);
  return (
    <div className="empathy-zone-page">
        { check for the current apiOutput && input not to be empty} <button type="button">add</button>
      <div className="emapthy-zone-container">
        <div className="parallelogram">
          <textarea className="empathy-zone-textarea" placeholder="i feel doubtful - im not sure if im doing the right thing." />
        </div>
      </div>
      <div className="empathy-zone-output-container">
        <div className="parallelogram">
            <div></div>
        </div>
      </div>
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