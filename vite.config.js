import path from "path";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [],
	clearScreen: false,
	root: "./src",
	server: {
		host: host || false,
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
		open: false,
	},
	envPrefix: ["VITE_", "TAURI_ENV_*"],
	build: {
		target:
			process.env.TAURI_ENV_PLATFORM == "windows"
				? "chrome105"
				: "safari13",
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
		outDir: "../dist",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
