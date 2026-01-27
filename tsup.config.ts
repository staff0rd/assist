import { cpSync } from "node:fs";
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
		cpSync("src/commands/enable-ralph", "dist/commands/enable-ralph", {
			recursive: true,
		});
	},
});
