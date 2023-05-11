import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { authOptions } from './api/auth/[...nextauth]';
import Button from '../lib/button/button';
import Header from '../lib/header/header';
import Category from '../lib/category/category';
import CategoryGrid from '../lib/category-grid/category-grid';
import Footer from '../lib/footer/footer';
import { useEffect } from 'react';
import { getUserId, addUser } from '../utils/client/db-helpers';
// import Root from '../lib/root/root';

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
          console.log(userId)
          addUser(names[0], names[1], session.user.email);
        }
      })
      .catch((err) => {
        console.log(err);
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
            <h3>emapthy zone</h3>
            <p>just want empathy?</p>
            <Link
              href="/empathy-zone"
              style={{ textDecoration: 'none' }}
            >
              <Button>let&apos;s go</Button>
            </Link>
          </Category>
          {/* <Category>
            <h3>prompt</h3>
            <p>go to a text convo w jen</p>
            <Link
              href="/prompt"
              style={{ textDecoration: 'none' }}
            >
              <Button>let&apos;s go</Button>
            </Link>
          </Category> */}
          <Category>
            <h3>audio call</h3>
            <p>go on a audio call w jen!</p>
            <Link
              href="/audio-call"
              style={{ textDecoration: 'none' }}
            >
              <Button>let&apos;s go</Button>
            </Link>
          </Category>
          <Category>
            <h3>snaplog</h3>
            <p>log ur thoughts</p>
            <Link
              href="/snaplog"
              style={{ textDecoration: 'none' }}
            >
              <Button>let&apos;s go</Button>
            </Link>
          </Category>
        {/* <Category>
            <h3>scoreboard</h3>
            <p>see ur notes on jen&apos;s advice</p>
            <Link href="/scoreboard"><Button onClickAction={() => {}}>let&apos;s go</Button></Link>
          </Category> */}
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
