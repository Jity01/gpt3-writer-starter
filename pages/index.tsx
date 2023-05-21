import { signIn, getProviders } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../components/layout/layout';
import Button from '../components/button/button';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

function Home() {
  return (
    <>
      <Head>
        <title>reinforce!</title>
      </Head>
      <Layout>
        <h4 style={{ fontSize: '1.4em' }}>hello, hello, hello :)</h4>
        <h1>welcome to reinforce!</h1>
        <h3>to talk to jen, sign in here.</h3>
        <Button onClickAction={() => signIn() } isGenerating={false}>sign in!</Button>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    return { redirect: { destination: '/dashboard' } };
  }
  const providers = await getProviders();
  return {
    props: {
      providers: providers || [],
    },
  };
}

export default Home;
