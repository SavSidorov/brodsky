'use client';

import {
	cosineSimilarity,
	downloadAllNotes,
	generateEmbedding,
} from '@/app/helpers';
import { Note } from '@/app/types';
import {
	CheckOutlined,
	DeleteOutlined,
	DownloadOutlined,
	PlusOutlined,
	RedoOutlined,
} from '@ant-design/icons';
import { Button, Input, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

const { TextArea } = Input;

export default function Home() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [currentNote, setCurrentNote] = useState<Note | null>(null);
	const [similarNotes, setSimilarNotes] = useState<Note[]>([]);
	const [value, setValue] = useState('');
	const [screenWidth, setScreenWidth] = useState(0);

	const mobileBreakpoint = 1000;

	useEffect(() => {
		// This function will run whenever the window size changes
		const handleResize = () => {
			setScreenWidth(window.innerWidth);
		};

		// Run the function once to get the initial window size
		handleResize();

		// Subscribe to window resize events
		window.addEventListener('resize', handleResize);

		// Cleanup function: remove the event listener when the component unmounts
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []); // No dependencies so the effect only runs once on mount and on unmount

	const fetchAllNotes = async () => {
		const res = await fetch('/api/getNotes');
		const data = await res.json();
		setNotes(data.data);
	};

	// Fetch all notes on page load
	useEffect(() => {
		fetchAllNotes();
	}, []);

	const setRandomNote = (notes: Note[]) => {
		const randomIndex = Math.floor(Math.random() * notes.length);
		const selectedNote = notes[randomIndex];
		setCurrentNote(selectedNote);
		setValue(selectedNote?.text || '');
	};

	// Called when the plus button is pressed
	const createNewNote = () => {
		setCurrentNote(null);
		setValue('');
	};

	const handleSubmit = async (text: string) => {
		// If there is a current note, update it
		if (currentNote && currentNote.id) {
			await fetch('/api/updateNote', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: currentNote.id, text: text }),
			});
		} else {
			// Otherwise, create a new note
			await fetch('/api/addNote', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ text: text }),
			});
		}

		// After submitting, re-fetch the messages
		const res = await fetch('/api/getNotes');
		const data = await res.json();
		setNotes(data.data);
		setRandomNote(notes);

		message.success('Note saved successfully!');
	};

	// Called when the delete button is pressed
	const handleDelete = (id?: string) => {
		const noteId = id || currentNote?.id;
		if (noteId) {
			Modal.confirm({
				title: 'Are you sure you want to delete this note?',
				centered: true,
				onOk: async () => {
					await fetch('/api/deleteNote', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ id: noteId }),
					});

					const res = await fetch('/api/getNotes');
					const data = await res.json();

					// Set a random note if the deleted note was the current note
					if (id == currentNote?.id) {
						setNotes(data.data);
						setRandomNote(notes);
					} else {
						setNotes(data.data);
					}

					// Remove the deleted note from the similar notes list
					setSimilarNotes((prevSimilarNotes) =>
						prevSimilarNotes.filter((note) => note.id !== noteId)
					);

					message.success('Note deleted successfully!');
				},
			});
		} else {
			message.error("The note you're trying to delete does not exist.");
		}
	};

	// Called when the Find Similar button is pressed
	const handleFindSimilar = async (value: string) => {
		const valueEmbedding = await generateEmbedding(value);

		if (!valueEmbedding) {
			message.error('Embedding could not be generated');
			return;
		}

		// Calculate the similarity between the value and each note
		const similarities = notes
			.filter((note) => note.embedding)
			.map((note) => {
				return {
					id: note.id,
					similarity: cosineSimilarity(valueEmbedding, note.embedding!),
				};
			});

		// Get the top 3 similarities, filtering out the note that is being compared against (similarity near 1)
		similarities.sort((a, b) => b.similarity - a.similarity);
		const filteredSimilarities = similarities.filter(
			(sim) => sim.similarity < 0.99
		);
		const top3Similarities = filteredSimilarities.slice(0, 3);

		// Fetch similar notes
		const similarNotes = top3Similarities
			.map((sim) => notes.find((note) => note.id === sim.id))
			.filter((note) => note !== undefined) as Note[];

		setSimilarNotes(similarNotes);
	};

	return (
		<main className={styles.main}>
			<div className={styles.top}>
				<h1>brodsky</h1>
				<Button type='default' onClick={() => downloadAllNotes(notes)}>
					<DownloadOutlined />
					Download All
				</Button>
			</div>

			<div className={styles.center}>
				{screenWidth > mobileBreakpoint && (
					<div className={styles.centerLeft}></div>
				)}

				<div className={styles.createNote}>
					<div className={styles.new}>
						<Button type='text' onClick={createNewNote}>
							<PlusOutlined />
						</Button>
					</div>

					<div className={styles.textInput}>
						<TextArea
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder={"What's on your mind?"}
							autoSize={{ minRows: 6, maxRows: 10 }}
						/>
					</div>

					<div className={styles.controls}>
						<Button type='text' onClick={() => setRandomNote(notes)}>
							<RedoOutlined />
						</Button>

						<Button type='text' onClick={() => handleDelete(currentNote?.id)}>
							<DeleteOutlined />
						</Button>

						<Button
							type='text'
							onClick={() => handleSubmit(value ? value : '')}
						>
							<CheckOutlined />
						</Button>
					</div>
				</div>

				{screenWidth > mobileBreakpoint && (
					<div className={styles.centerRight}>
						<Button
							type='default'
							onClick={() => {
								handleFindSimilar(value);
							}}
						>
							Find Similar Notes
						</Button>
						<div className={styles.similarNotes}>
							{similarNotes.map((note) => (
								<div
									className={styles.similarNote}
									key={note.id}
									onClick={() => {
										navigator.clipboard.writeText(note.text);
										message.success('Copied to clipboard!');
									}}
								>
									<div className={styles.noteHeader}>
										<Button
											type='text'
											onClick={(e) => {
												e.stopPropagation();
												handleDelete(note.id);
											}}
										>
											<DeleteOutlined />
										</Button>
									</div>
									<div className={styles.noteText}>
										{note.text.length > 100
											? note.text.substring(0, 100) + '...'
											: note.text}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			<div className={styles.bottom}></div>
		</main>
	);
}
