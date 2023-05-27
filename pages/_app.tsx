/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/forbid-prop-types */

import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import './styles.css';

if (typeof window !== 'undefined') {
  posthog.init(
    process.env.NEXT_PUBLIC_POSTHOG_KEY,
    {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      loaded: () => {
        if (process.env.NODE_ENV === "development") posthog.debug()
      },
    }
  )
}

function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);
  return (
    <SessionProvider session={session}>
      <PostHogProvider client={posthog}>
        <Component {...pageProps} />
      </PostHogProvider>
    </SessionProvider>
  );
}

export default App;
