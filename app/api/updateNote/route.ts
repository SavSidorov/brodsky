import { generateEmbedding } from '@/app/helpers';
import app from '@/firebase';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const firestore = getFirestore(app);

export async function POST(req: Request, res: Response) {
	try {
		const data = await req.json();
		const embedding = await generateEmbedding(data.text);
		const docRef = doc(firestore, 'testCollection', data.id);

		await updateDoc(docRef, {
			text: data.text,
			embedding: embedding,
			updatedAt: new Date().toISOString(),
		});
		return NextResponse.json({ id: data.id });
	} catch (error) {
		console.error('Error updating Firestore document:', error);
		return NextResponse.error;
	}
}
