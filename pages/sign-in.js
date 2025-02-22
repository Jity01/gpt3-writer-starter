/* eslint-disable import/no-extraneous-dependencies */

import PropTypes from 'prop-types';
import { getProviders, signIn } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import Layout from '../lib/layout/layout';
import Button from '../lib/button/button';

function SignIn({ providers }) {
  return (
    <Layout>
     { Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <Button
            type="button"
            onClickAction={() => signIn(provider.id)}
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
    return { redirect: { destination: '/dashboard' } };
  }
  const providers = await getProviders();
  return {
    props: {
      providers: providers || [],
    },
  };
}

export default SignIn;
