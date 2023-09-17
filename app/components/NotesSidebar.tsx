import { Note } from '@/app/types';
import { Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from './NotesSidebar.module.css';

interface NotesSidebarProps {
	similarNotes: Note[];
	handleDelete: (id?: string) => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
	similarNotes,
	handleDelete,
}) => {
	return (
		<div className={styles.sidebar}>
			<Button
				type='default'
				onClick={() => {
					// ... handle find similar functionality
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
	);
};
