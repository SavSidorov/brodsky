/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
	dest: 'public',
});

module.exports = withPWA({
	env: {
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	},
	webpack: (config) => {
		config.module.rules.push({
			test: /\.node$/,
			use: 'node-loader',
		});

		return config;
	},
});
