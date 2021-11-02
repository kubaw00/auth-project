import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { verifyPassword } from '../../../lib/auth';
import { connectDatabase } from '../../../lib/db';

export default NextAuth({
  session: {
    jwt: true,
  },
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const client = await connectDatabase();
        const user = await client
          .db()
          .collection('users')
          .findOne({ email: credentials.email });

        if (!user) {
          client.close();
          throw new Error('No user found!');
        }

        const isValid = verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Could not log you in!');
        }
        client.close();
        return { email: user.email };
      },
    }),
  ],
});