import { cpSync } from "node:fs";
import { build } from "esbuild";
import { defineConfig } from "tsup";
import pkg from "./package.json";

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
			entryPoints: ["src/commands/criteriaExtension/criteriaContentScript.ts"],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: "criteria-extension/content.js",
			jsx: "automatic",
			jsxImportSource: "react",
			define: { "process.env.NODE_ENV": '"production"' },
		});
		cpSync(
			"criteria-extension",
			"dist/commands/criteriaExtension/criteria-extension",
			{ recursive: true },
		);
		await build({
			entryPoints: {
				init: "src/commands/review/ci/reviewCiInit.ts",
				check: "src/commands/review/ci/reviewCiCheck.ts",
			},
			bundle: true,
			minify: true,
			platform: "node",
			format: "esm",
			target: "node22",
			outdir: "claude/skills/review-ci/scripts",
			outExtension: { ".js": ".mjs" },
			banner: {
				js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
			},
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
			define: {
				"process.env.NODE_ENV": '"production"',
				__ASSIST_VERSION__: JSON.stringify(pkg.version),
			},
		});
		await build({
			entryPoints: ["src/commands/sessions/web/ui/installMonacoGlobal.ts"],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: "dist/commands/sessions/web/monaco.js",
			loader: { ".ttf": "dataurl" },
		});
		await build({
			entryPoints: [
				"node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
			],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: "dist/commands/sessions/web/monaco.worker.js",
		});
	},
});
