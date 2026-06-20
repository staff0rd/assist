import { cpSync } from "node:fs";
import { build } from "esbuild";
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node22",
	outDir: "dist",
	clean: true,
	shims: true,
	silent: true,
	external: ["typescript", "better-sqlite3", "node-pty", "pg"],
	onSuccess: async () => {
		cpSync("allowed.cli-reads", "dist/allowed.cli-reads");
		cpSync("allowed.cli-writes", "dist/allowed.cli-writes");
		cpSync("src/commands/deploy", "dist/commands/deploy", { recursive: true });
		cpSync("src/commands/voice/python", "dist/commands/voice/python", {
			recursive: true,
		});
		cpSync("netcap-extension", "dist/commands/netcap/netcap-extension", {
			recursive: true,
		});
		await build({
			entryPoints: ["src/commands/sessions/web/ui/App.tsx"],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: "dist/commands/sessions/web/bundle.js",
			jsx: "automatic",
			jsxImportSource: "react",
			define: { "process.env.NODE_ENV": '"production"' },
		});
	},
});
