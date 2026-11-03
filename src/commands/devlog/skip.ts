import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { applySharedRepoConfigSet } from "../config/applySharedRepoConfigSet";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { isValidWeek } from "./isoWeek";

const SKIP_WEEKS_KEY = "devlog.skipWeeks";

async function loadRepoSkipWeeks(cwd: string): Promise<string[]> {
	const { block } = await resolveSharedRepoBlock(await getDb(), undefined, cwd);
	const devlog = block.devlog as { skipWeeks?: string[] } | undefined;
	return devlog?.skipWeeks ?? [];
}

export async function skip(
	week: string,
	cwd: string = process.cwd(),
): Promise<void> {
	if (!isValidWeek(week)) {
		console.log(chalk.red("Invalid week. Use YYYY-Www (e.g. 2026-W33)"));
		process.exit(1);
	}

	const existing = await loadRepoSkipWeeks(cwd);
	if (existing.includes(week)) {
		console.log(chalk.yellow(`${week} is already in ${SKIP_WEEKS_KEY}`));
		return;
	}

	const result = await applySharedRepoConfigSet(
		SKIP_WEEKS_KEY,
		[...new Set([...existing, week])].sort(),
		undefined,
		cwd,
	);
	if (!result.ok) {
		console.log(chalk.red(result.errors.join("\n")));
		process.exit(1);
	}
	console.log(
		chalk.green(
			`Added ${week} to ${SKIP_WEEKS_KEY} for repos.${result.label} (repo db)`,
		),
	);
}
