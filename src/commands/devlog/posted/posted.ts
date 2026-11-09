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

function resolveValue(permalink: string | undefined, skipped: boolean): string {
	if (skipped) {
		if (permalink) fail("Pass either a permalink or --skip, not both");
		return "skipped";
	}
	const value = permalink?.trim() ?? "";
	if (!/^https:\/\/\S+$/.test(value)) {
		fail(`Expected a Slack permalink (https://...) or --skip, got: ${value}`);
	}
	return value;
}

export function posted(
	week: string,
	permalink: string | undefined,
	options: { skip?: boolean } = {},
): void {
	if (!isValidWeek(week)) fail("Invalid week. Use YYYY-Www (e.g. 2026-W33)");
	const value = resolveValue(permalink, options.skip === true);
	const path = devEntryPath(getRepoName(), week, resolveDevDir());
	const updated = setFrontmatterSlack(readEntry(path), value);
	if (updated === null) fail(`${path} has no YAML frontmatter`);
	writeFileSync(path, updated);
	console.log(chalk.green(`Recorded slack: ${value} in ${path}`));
}
