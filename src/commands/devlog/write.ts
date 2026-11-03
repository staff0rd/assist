import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { readStdin } from "../../lib/readStdin";
import { resolveDevDir } from "./resolveDevDir";
import { getRepoName } from "./shared";
import { devEntryInputSchema } from "./write/devEntryInputSchema";
import { formatDevEntry } from "./write/formatDevEntry";

function parseInput(raw: string): unknown {
	try {
		return JSON.parse(raw);
	} catch (error) {
		console.error(chalk.red(`Invalid JSON on stdin: ${String(error)}`));
		process.exit(1);
	}
}

export async function write(): Promise<void> {
	const result = devEntryInputSchema.safeParse(parseInput(await readStdin()));
	if (!result.success) {
		for (const issue of result.error.issues) {
			console.error(chalk.red(`${issue.path.join(".")}: ${issue.message}`));
		}
		process.exit(1);
	}
	const devDir = resolveDevDir();
	const repoName = getRepoName();
	const path = join(devDir, repoName, `${result.data.week.toLowerCase()}.md`);
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, formatDevEntry(repoName, result.data));
	console.log(chalk.green(`Wrote ${path}`));
}
