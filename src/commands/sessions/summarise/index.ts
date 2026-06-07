import * as fs from "node:fs";
import chalk from "chalk";
import { discoverSessionJsonlPaths } from "../shared/discoverSessions";
import { hasSummary, writeSummary } from "./shared";
import { summariseSession } from "./summariseSession";

type SummariseOptions = {
	force?: boolean;
	limit?: string;
};

export async function summarise(options: SummariseOptions): Promise<void> {
	const files = await discoverSessionJsonlPaths();
	if (files.length === 0) {
		console.log(chalk.yellow("No sessions found."));
		return;
	}

	const toProcess = selectCandidates(files, options);

	if (toProcess.length === 0) {
		console.log(chalk.green("All sessions already summarised."));
		return;
	}

	console.log(
		chalk.cyan(
			`Summarising ${toProcess.length} session(s) (${files.length} total)…`,
		),
	);

	const { succeeded, failed } = processSessions(toProcess);

	console.log(
		chalk.green(`Done: ${succeeded} summarised`) +
			(failed > 0 ? chalk.yellow(`, ${failed} skipped`) : ""),
	);
}

function selectCandidates(
	files: string[],
	options: SummariseOptions,
): string[] {
	const candidates = options.force
		? files
		: files.filter((f) => !hasSummary(f));
	// Sort newest-first by mtime so --limit processes recent sessions first
	candidates.sort((a, b) => {
		try {
			return fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs;
		} catch {
			return 0;
		}
	});
	const limit = options.limit ? Number.parseInt(options.limit, 10) : undefined;
	return limit && limit > 0 ? candidates.slice(0, limit) : candidates;
}

function processSessions(files: string[]): {
	succeeded: number;
	failed: number;
} {
	let succeeded = 0;
	let failed = 0;

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		process.stdout.write(chalk.dim(`  [${i + 1}/${files.length}] `));

		const summary = summariseSession(file);
		if (summary) {
			writeSummary(file, summary);
			succeeded++;
			process.stdout.write(`${chalk.green("✓")} ${summary}\n`);
		} else {
			failed++;
			process.stdout.write(` ${chalk.yellow("skip")}\n`);
		}
	}

	return { succeeded, failed };
}
