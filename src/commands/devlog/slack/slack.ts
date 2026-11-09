import { mkdirSync, writeFileSync } from "node:fs";
import chalk from "chalk";
import { postSlackMessage } from "../../slack/postSlackMessage";
import { slackWorkingFile } from "../../slack/slackWorkingFile";
import { devEntryPath } from "../devEntryPath";
import { isValidWeek } from "../isoWeek";
import { resolveDevDir } from "../resolveDevDir";
import { getRepoName } from "../shared";
import { devlogSlackChannel } from "./devlogSlackChannel";
import { readDevEntryFile } from "./readDevEntryFile";
import { renderDevlogSlackParts } from "./renderDevlogSlackParts";

function fail(message: string): never {
	console.error(chalk.red(message));
	process.exit(1);
}

function writeParts(channel: string, parts: string[]): string[] {
	mkdirSync(slackWorkingFile(channel).dir, { recursive: true });
	return parts.map((part, index) => {
		const { bodyPath } = slackWorkingFile(channel, index + 1);
		writeFileSync(bodyPath, `${part}\n`);
		return bodyPath;
	});
}

export async function slack(week: string): Promise<void> {
	if (!isValidWeek(week)) fail("Invalid week. Use YYYY-Www (e.g. 2026-W33)");
	const channel = devlogSlackChannel();
	const repoName = getRepoName();
	const path = devEntryPath(repoName, week, resolveDevDir());
	const entry = readDevEntryFile(path);
	if (!entry) fail(`No dev entry for ${week} at ${path}`);
	if (entry.slack) fail(`${week} is already posted: slack: ${entry.slack}`);

	const parts = renderDevlogSlackParts(entry, entry.project ?? repoName, week);
	if (parts.length === 1) {
		await postSlackMessage(channel, { body: parts[0] });
		return;
	}
	await postSlackMessage(channel, { parts: writeParts(channel, parts) });
}
