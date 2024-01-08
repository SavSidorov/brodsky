'use client';

import { GoogleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { signIn } from 'next-auth/react';
import styles from './page.module.css';

export default function Login() {
	return (
		<main className={styles.main}>
			<h1 className={styles.title}>brodsky</h1>
			<Button
				type='text'
				onClick={() =>
					signIn('google', {
						callbackUrl: '/write',
					})
				}
			>
				<GoogleOutlined />
				Sign in with Google
			</Button>
		</main>
	);
}
