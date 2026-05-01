import { mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { exportFile } from "./exportFile";

export type MermaidExportOptions = {
	out?: string;
	index?: number;
};

export async function mermaidExport(
	file: string | undefined,
	options: MermaidExportOptions = {},
): Promise<void> {
	const { mermaid } = loadConfig();
	const outDir = resolve(process.cwd(), options.out ?? ".");
	mkdirSync(outDir, { recursive: true });

	if (options.index !== undefined) {
		if (!Number.isInteger(options.index) || options.index < 1) {
			console.error(
				chalk.red(`--index must be a positive integer (got ${options.index})`),
			);
			process.exit(1);
		}
		if (!file) {
			console.error(chalk.red("--index requires a file argument"));
			process.exit(1);
		}
	}

	const files = file
		? [file]
		: readdirSync(process.cwd())
				.filter((name) => name.toLowerCase().endsWith(".md"))
				.sort();

	if (files.length === 0) {
		console.log(chalk.gray("No markdown files found in current directory."));
		return;
	}

	for (const f of files) {
		await exportFile(f, outDir, mermaid.krokiUrl, options.index);
	}
}
