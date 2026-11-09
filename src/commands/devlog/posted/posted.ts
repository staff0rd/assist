import { readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { devEntryPath } from "../devEntryPath";
import { isValidWeek } from "../isoWeek";
import { resolveDevDir } from "../resolveDevDir";
import { getRepoName } from "../shared";
import { setFrontmatterSlack } from "./setFrontmatterSlack";

function fail(message: string): never {
	console.error(chalk.red(message));
	process.exit(1);
}

function readEntry(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		fail(`No dev entry at ${path}`);
	}
}

export function posted(week: string, permalink: string): void {
	if (!isValidWeek(week)) fail("Invalid week. Use YYYY-Www (e.g. 2026-W33)");
	if (!/^https:\/\/\S+$/.test(permalink.trim())) {
		fail(`Expected a Slack permalink (https://...), got: ${permalink}`);
	}
	const path = devEntryPath(getRepoName(), week, resolveDevDir());
	const updated = setFrontmatterSlack(readEntry(path), permalink.trim());
	if (updated === null) fail(`${path} has no YAML frontmatter`);
	writeFileSync(path, updated);
	console.log(chalk.green(`Recorded slack: ${permalink.trim()} in ${path}`));
}
