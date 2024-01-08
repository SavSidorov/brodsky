import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

if (
	!process.env.GOOGLE_CLIENT_ID ||
	!process.env.GOOGLE_CLIENT_SECRET ||
	!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
	!process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL ||
	!process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
) {
	throw new Error('Missing environment variables.');
}

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],
	adapter: FirestoreAdapter({
		credential: cert({
			projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
			clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(
				/\\n/g,
				'\n'
			),
		}),
	}),
	callbacks: {
		session: async ({ session, token }) => {
			if (session?.user) {
				session.user.id = token.uid;
			}
			return session;
		},
		jwt: async ({ user, token }) => {
			if (user) {
				token.uid = user.id;
			}
			return token;
		},
	},
	session: {
		strategy: 'jwt',
	},
	debug: true,
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
