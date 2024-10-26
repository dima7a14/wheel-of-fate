import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [],
	clearScreen: false,
	root: "./src",
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
		open: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
