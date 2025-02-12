import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		enhancedImages(), // usage: <enhanced:img src="./path/to/your/image.jpg" alt="An alt text" />
		sveltekit()
	],
	server: {
		host: "0.0.0.0",
		port: process.env.port,
		watch: {
			ignored: ['**/playwright-report/**']
		},
		allowedHosts: true
	},
	preview: {
		host: "0.0.0.0",
		port: process.env.port,
		allowedHosts: true
	},
	define: {
		configUrl: JSON.stringify(process.env.configUrl)
	}
});
