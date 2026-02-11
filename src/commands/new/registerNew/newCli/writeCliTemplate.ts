import { mkdirSync, writeFileSync } from "node:fs";

export function writeCliTemplate(name: string): void {
	console.log("Writing tsconfig.json...");
	writeFileSync(
		"tsconfig.json",
		JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					module: "ESNext",
					moduleResolution: "bundler",
					outDir: "./dist",
					rootDir: "./src",
					strict: true,
					esModuleInterop: true,
					resolveJsonModule: true,
					skipLibCheck: true,
					forceConsistentCasingInFileNames: true,
				},
				include: ["src/**/*"],
				exclude: ["node_modules"],
			},
			null,
			"\t",
		),
	);

	console.log("Writing tsup.config.ts...");
	writeFileSync(
		"tsup.config.ts",
		`import { defineConfig } from "tsup";
export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node22",
	outDir: "dist",
	clean: true,
	shims: true,
});
`,
	);

	console.log("Writing src/index.ts...");
	mkdirSync("src", { recursive: true });
	writeFileSync(
		"src/index.ts",
		`#!/usr/bin/env node
import { Command } from "commander";
const program = new Command();
program.name("${name}").description("").version("0.0.0");
program.parse();
`,
	);
}
