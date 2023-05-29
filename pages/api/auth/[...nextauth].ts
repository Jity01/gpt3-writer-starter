import NextAuth from 'next-auth/next';
import Google from 'next-auth/providers/google';
// import Twitter from 'next-auth/providers/twitter';

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Twitter({
    //   clientId: process.env.TWITTER_CONSUMER_KEY,
    //   clientSecret: process.env.TWITTER_CONSUMER_SECRET,
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
