import { generateEmbedding } from '@/app/helpers';
import app from '@/firebase';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const firestore = getFirestore(app);

export async function POST(req: Request, res: Response) {
	try {
		const data = await req.json();
		const embedding = await generateEmbedding(data.text);

		const addDocRes = await addDoc(collection(firestore, 'testCollection'), {
			text: data.text,
			embedding: embedding,
			createdAt: new Date().toISOString(),
		});
		return NextResponse.json({ id: addDocRes.id });
	} catch (error) {
		console.error('Error writing to Firestore:', error);
		return NextResponse.error;
	}
}
