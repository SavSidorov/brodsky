import app from '@/firebase';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const firestore = getFirestore(app);

export async function GET() {
	try {
		const snapshot = await getDocs(collection(firestore, 'testCollection'));
		const data = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		// Set cache headers to avoid caching on Vercel
		const response = NextResponse.json({ data });
		//response.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');

		return response;
	} catch (error) {
		console.error('Error accessing Firestore:', error);
		return NextResponse.error;
	}
}
