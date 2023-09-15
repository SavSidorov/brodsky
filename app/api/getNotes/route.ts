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
		return NextResponse.json({ data });
	} catch (error) {
		console.error('Error accessing Firestore:', error);
		return NextResponse.error;
	}
}
