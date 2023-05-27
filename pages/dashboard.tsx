import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { authOptions } from './api/auth/[...nextauth]';
import Button from '../components/button/button';
import Header from '../components/header/header';
import Category from '../components/category/category';
import CategoryGrid from '../components/category-grid/category-grid';
import Footer from '../components/footer/footer';
import { useEffect } from 'react';
import { getUserId, addUser } from '../utils/client/db-helpers';

function Dashboard() {
  const { data: session } = useSession();
  const names = session.user.name.split(" ");
  const getIdOfUser = () => {
    const userId = getUserId(names[0], names[1], session.user.email);
    return userId;
  };
  const userId = getIdOfUser();
  useEffect(() => {
    userId
      .then((id) => {
        if (id === -1) {
          addUser(names[0], names[1], session.user.email);
        }
      })
      .catch(() => {
      });
  }, [])
  return (
    <>
      <Head>
        <title>dashboard :)</title>
      </Head>
      <div style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Header username={`${session.user.name.toLowerCase()}`} page="dashboard" />
        <CategoryGrid>
          <Category>
            <h3>snaplog</h3>
            <p>log ur thoughts</p>
            <Link
              href="/snaplog"
              style={{ textDecoration: 'none' }}
            >
              <Button onClickAction={() => {}} isGenerating={false}>let&apos;s go</Button>
            </Link>
          </Category>
          <Category>
            <h3>search</h3>
            <p>search thru ur thoughts</p>
            <Link
              href="/prompt"
              style={{ textDecoration: 'none' }}
            >
              <Button onClickAction={() => {}} isGenerating={false}>let&apos;s go</Button>
            </Link>
          </Category>
        </CategoryGrid>
      </div>
      <br />
      <br />
      <br />
      <Footer />
    </>
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

export default Dashboard;
