import { isoWeekRange } from "../isoWeek";
import { formatDateRange } from "./formatDateRange";
import type { DevEntryFile } from "./readDevEntryFile";

const SECTIONS = [
	["added", "Added"],
	["changed", "Changed"],
	["fixed", "Fixed"],
] as const;

function versionRange(versions: DevEntryFile["versions"]) {
	if (!versions?.first || !versions.last) return null;
	return versions.first === versions.last
		? versions.first
		: `${versions.first} → ${versions.last}`;
}

function dateRange(entry: DevEntryFile, week: string) {
	const { first, last } = entry.dates ?? {};
	if (first && last) return formatDateRange(first, last);
	const { start, end } = isoWeekRange(week);
	return formatDateRange(start, end);
}

function renderHeader(entry: DevEntryFile, project: string, week: string) {
	const head = `**${project} · ${dateRange(entry, week)}**`;
	const versions = versionRange(entry.versions);
	return versions ? `${head} · ${versions}` : head;
}

function renderCounts(entry: DevEntryFile): string | null {
	const counts = SECTIONS.map(
		([key]) => [key, entry[key]?.length ?? 0] as const,
	)
		.filter(([, count]) => count > 0)
		.map(([key, count]) => `${count} ${key}`);
	return counts.length > 0 ? counts.join(" · ") : null;
}

function entryUrl(baseUrl: string, project: string, week: string) {
	return `${baseUrl.replace(/\/+$/, "")}/${project}/${week.toLowerCase()}`;
}

function renderParent(
	entry: DevEntryFile,
	project: string,
	week: string,
	baseUrl?: string,
) {
	const lines = [renderHeader(entry, project, week)];
	if (entry.title) lines.push(`**${entry.title}**`);
	const blocks = [lines.join("\n")];
	if (entry.lede) blocks.push(entry.lede);
	const counts = renderCounts(entry);
	if (counts) blocks.push(counts);
	if (baseUrl)
		blocks.push(`[Read the full entry →](${entryUrl(baseUrl, project, week)})`);
	return blocks.join("\n\n");
}

function renderReply(entry: DevEntryFile): string | null {
	const sections = SECTIONS.filter(
		([key]) => (entry[key]?.length ?? 0) > 0,
	).map(([key, heading]) =>
		[
			`**${heading}**`,
			...(entry[key] ?? []).map((item) => `- ${item.text}`),
		].join("\n"),
	);
	return sections.length > 0 ? sections.join("\n\n") : null;
}

export function renderDevlogSlackParts(
	entry: DevEntryFile,
	project: string,
	week: string,
	baseUrl?: string,
): string[] {
	const reply = renderReply(entry);
	const parent = renderParent(entry, project, week, baseUrl);
	return reply ? [parent, reply] : [parent];
}
