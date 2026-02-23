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
	external: ["typescript"],
	onSuccess: async () => {
		cpSync("src/commands/lint", "dist/commands/lint", { recursive: true });
		cpSync("src/commands/deploy", "dist/commands/deploy", { recursive: true });
		cpSync("src/commands/voice/python", "dist/commands/voice/python", {
			recursive: true,
		});
		await build({
			entryPoints: ["src/commands/backlog/web/ui/App.tsx"],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: "dist/commands/backlog/web/bundle.js",
			jsx: "automatic",
			jsxImportSource: "react",
			define: { "process.env.NODE_ENV": '"production"' },
		});
	},
});
