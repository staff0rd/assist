import { readFileSync, writeFileSync } from "node:fs";
import { basename, extname, resolve } from "node:path";
import chalk from "chalk";
import { renderBlock } from "./renderBlock";

export async function exportFile(
	file: string,
	outDir: string,
	krokiUrl: string,
	onlyIndex: number | undefined,
): Promise<void> {
	const content = readFileSync(file, "utf8");
	const blocks = extractMermaidBlocks(content);
	const stem = basename(file, extname(file));

	if (onlyIndex !== undefined) {
		if (onlyIndex < 1 || onlyIndex > blocks.length) {
			console.error(
				chalk.red(
					`${file}: --index ${onlyIndex} out of range (file has ${blocks.length} diagram(s))`,
				),
			);
			process.exit(1);
		}
		console.log(
			chalk.gray(
				`${file} — rendering diagram ${onlyIndex} of ${blocks.length}`,
			),
		);
	} else {
		console.log(chalk.gray(`${file} — ${blocks.length} diagram(s)`));
	}

	for (const [i, source] of blocks.entries()) {
		const idx = i + 1;
		if (onlyIndex !== undefined && idx !== onlyIndex) continue;
		const outPath = resolve(outDir, `${stem}-${idx}.svg`);
		const svg = await renderBlock(krokiUrl, source);
		writeFileSync(outPath, svg, "utf8");
		console.log(chalk.green(`  → ${outPath}`));
	}
}

function extractMermaidBlocks(markdown: string): string[] {
	const matches = [...markdown.matchAll(/```mermaid\n([\s\S]*?)\n```/g)];
	return matches.map(([, src]) => src);
}
