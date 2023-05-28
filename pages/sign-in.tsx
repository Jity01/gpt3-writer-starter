/* eslint-disable import/no-extraneous-dependencies */

import PropTypes from 'prop-types';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Layout from '../components/layout/layout';
import Button from '../components/button/button';

interface Provider {
  name: string;
  id: string;
}

function SignIn({ providers }) {
  return (
    <Layout>
     { Object.values(providers).map((provider: Provider) => (
        <div key={provider.name}>
          <Button
            onClickAction={() => signIn(provider.id)}
            isGenerating={false}
          >
            sign in with
            {' '}
            {provider.name.toLowerCase()}
          </Button>
        </div>
      ))}
    </Layout>
  );
}

SignIn.propTypes = {
  providers: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
};

export async function getServerSideProps(context) {
  const { req, res } = context;
  const session = await getServerSession(req, res, authOptions);
  if (session) {
    return { redirect: { destination: '/snaplog' } };
  }
  const providers = await getProviders();
  return {
    props: {
      providers: providers || [],
    },
  };
}

export default SignIn;
