export interface AuthorLink {
	label: string;
	url: string;
}

export interface Author {
	name: string;
	tagline: string;
	bio: string;
	website: string;
	xHandle: string;
	github: string;
	skills: {
		cloud: string[];
		frontend: string[];
		backend: string[];
		database: string[];
		blockchain: string[];
	};
	pinnedRepos: { name: string; description: string; language: string; url: string }[];
	links: AuthorLink[];
}

export const author: Author = {
	name: 'Rehoboth Ini',
	tagline: 'Backend focused & Cloud Engineer',
	bio: 'Improving every day in enterprise-level technologies and low-level languages. Familiar with DevOps tools and the production-ready pipelines behind real-world solutions. Currently focusing on the internals, because surface-level knowledge is useless in today\u2019s software landscape.',
	website: 'https://cyberpunkinc.xyz',
	xHandle: 'cyberpunk_web3',
	github: 'AlphaTechini',
	skills: {
		cloud: ['AWS', 'GCP', 'Cloudflare'],
		frontend: ['HTML/CSS', 'JavaScript', 'Svelte'],
		backend: ['Golang', 'Node.js', 'Rust'],
		database: ['PostgreSQL', 'MongoDB'],
		blockchain: ['Solidity', 'Hardhat', 'Soroban']
	},
	pinnedRepos: [
		{
			name: 'vector-db-migration',
			description: 'Enables migration of data from one Vector Database to another',
			language: 'Go',
			url: 'https://github.com/AlphaTechini/vector-db-migration'
		},
		{
			name: 'Fault-Tolerant-On-Chain-Event-Webhook-Service',
			description:
				'Subscribe to blockchain events using webhooks and REST endpoints instead of complex code and libraries',
			language: 'Svelte',
			url: 'https://github.com/AlphaTechini/Fault-Tolerant-On-Chain-Event-Webhook-Service'
		},
		{
			name: 'Oracle',
			description:
				'Decentralized data aggregator using deviation-from-median consensus to reward or penalize data providers',
			language: 'Go',
			url: 'https://github.com/AlphaTechini/Oracle'
		},
		{
			name: 'system-design-visualizer',
			description:
				'AI-powered system design platform for enterprise architects: visualize, validate, and deploy large-scale distributed systems',
			language: 'Go',
			url: 'https://github.com/AlphaTechini/system-design-visualizer'
		},
		{
			name: 'Memory-Lane',
			description: 'Web app for dementia and memory illness patients',
			language: 'Svelte',
			url: 'https://github.com/AlphaTechini/Memory-Lane'
		},
		{
			name: 'doc-fetch',
			description:
				'Dynamic documentation fetching CLI that converts entire documentation sites to single markdown files for AI/LLM consumption',
			language: 'Svelte',
			url: 'https://github.com/AlphaTechini/doc-fetch'
		}
	],
	links: [
		{ label: 'Website', url: 'https://cyberpunkinc.xyz' },
		{ label: 'GitHub', url: 'https://github.com/AlphaTechini' },
		{ label: 'X', url: 'https://x.com/cyberpunk_web3' }
	]
};
