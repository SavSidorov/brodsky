import app from '@/firebase';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { NextResponse } from 'next/server';

const firestore = getFirestore(app);

export async function DELETE(req: Request, res: Response) {
	try {
		const data = await req.json();
		const documentRef = doc(firestore, 'testCollection', data.id); // Get the document reference
		await deleteDoc(documentRef);
		return NextResponse.json({ id: data.id });
	} catch (error) {
		console.error('Error writing to Firestore:', error);
		return NextResponse.error;
	}
}
