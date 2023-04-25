import Layout from "../lib/layout/layout";
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

function Scoreboard() {
  return (
    <Layout>
      <h3>a documentation of the times you used jen&apos;s advice and how that worked out for u - coming soon!</h3>
    </Layout>
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

export default Scoreboard;
