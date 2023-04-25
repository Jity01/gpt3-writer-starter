import Layout from "../lib/layout/layout";
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

function Bookmarks() {
    return (
        <Layout>
            <h3>a documentation of ur sessions w jen! coming soon :)</h3>
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
  
export default Bookmarks;