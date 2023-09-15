import { Note } from '@/app/types';
import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	dangerouslyAllowBrowser: true,
});

export function cosineSimilarity(vecA: number[], vecB: number[]) {
	const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

export function downloadAllNotes(notes: Note[]) {
	const data = JSON.stringify(
		notes.map((note) => {
			const { embedding, createdAt, updatedAt, ...rest } = note;
			return rest;
		}),
		null,
		2
	);
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'notes.json';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export async function generateEmbedding(text: string) {
	try {
		const response = await openai.embeddings.create({
			input: text,
			model: 'text-embedding-ada-002',
		});

		return response.data[0].embedding;
	} catch (error) {
		console.error('Error generating embedding:', error);
		return null;
	}
}
