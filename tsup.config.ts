import { cpSync, rmSync, writeFileSync } from "node:fs";
import { build } from "esbuild";
import { defineConfig } from "tsup";
import pkg from "./package.json";
import { buildLockPath } from "./src/build/buildLockPath";
import { swapBuildDir } from "./src/build/swapBuildDir";

// why: the build lands in a staging dir that is swapped into dist at the end,
// so dist/index.js never goes missing while running processes spawn assist
const STAGING = "dist.next";
const LOCK = buildLockPath(".");

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node22",
	outDir: STAGING,
	clean: true,
	shims: true,
	silent: true,
	external: [
		"typescript",
		"better-sqlite3",
		"node-pty",
		"pg",
		"@anthropic-ai/claude-agent-sdk",
	],
	plugins: [
		{
			name: "build-lock",
			buildStart() {
				writeFileSync(LOCK, String(process.pid));
			},
		},
	],
	onSuccess: async () => {
		writeFileSync(`${STAGING}/built-version`, pkg.version);
		cpSync("allowed.cli-reads", `${STAGING}/allowed.cli-reads`);
		cpSync("allowed.cli-writes", `${STAGING}/allowed.cli-writes`);
		cpSync("src/commands/deploy", `${STAGING}/commands/deploy`, {
			recursive: true,
		});
		cpSync("netcap-extension", `${STAGING}/commands/netcap/netcap-extension`, {
			recursive: true,
		});
		await build({
			entryPoints: {
				content: "src/commands/extension/criteriaContentScript.ts",
				docs: "src/commands/extension/docsFeedback/docsContentScript.ts",
				consoleMain:
					"src/commands/extension/consoleCapture/consoleMainScript.ts",
				console:
					"src/commands/extension/consoleCapture/consoleContentScript.ts",
				background: "src/commands/extension/sendToAssist/assistBackground.ts",
				options: "src/commands/extension/sendToAssist/assistOptions.ts",
			},
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outdir: "extension",
			jsx: "automatic",
			jsxImportSource: "react",
			define: { "process.env.NODE_ENV": '"production"' },
		});
		cpSync("extension", `${STAGING}/commands/extension/extension`, {
			recursive: true,
		});
		await build({
			entryPoints: ["src/commands/sessions/web/ui/App.tsx"],
			bundle: true,
			minify: true,
			format: "iife",
			target: "es2020",
			outfile: `${STAGING}/commands/sessions/web/bundle.js`,
			loader: { ".woff2": "dataurl" },
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
			outfile: `${STAGING}/commands/sessions/web/monaco.js`,
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
			outfile: `${STAGING}/commands/sessions/web/monaco.worker.js`,
		});
		swapBuildDir(STAGING, "dist");
		rmSync(LOCK, { force: true });
	},
});
