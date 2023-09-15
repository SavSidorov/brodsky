/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
