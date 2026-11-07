import type { CommitEntry } from "./CommitEntry";

type WatchReport = {
	version: string;
	commits: CommitEntry[];
	pulled: boolean;
	restarts: string[];
	syncs: string[];
};

const escapeCell = (text: string): string =>
	text.replaceAll("|", String.raw`\|`);

export function renderWatchReport({
	version,
	commits,
	pulled,
	restarts,
	syncs,
}: WatchReport): string {
	const lines = [`**Version** ${version}`, ""];

	if (commits.length === 0) {
		lines.push(pulled ? "_no new commits_" : "_no commits_");
	} else {
		lines.push("| SHA | When | Subject |", "| --- | --- | --- |");
		for (const commit of commits) {
			lines.push(
				`| \`${commit.short}\` | ${commit.when} | ${escapeCell(commit.subject)} |`,
			);
		}
	}

	lines.push("", "**Restarts**", "");
	lines.push(
		...(restarts.length === 0
			? ["- none needed"]
			: restarts.map((restart) => `- ${restart}`)),
	);

	lines.push("", "**Sync**", "");
	lines.push(
		...(syncs.length === 0
			? ["- not needed"]
			: syncs.map((sync) => `- ${sync}`)),
	);

	return lines.join("\n");
}
