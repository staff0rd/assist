import type { DevEntryFile } from "./readDevEntryFile";

const SECTIONS = [
	["added", "Added"],
	["changed", "Changed"],
	["fixed", "Fixed"],
] as const;

function range(span: { first?: string; last?: string } | undefined) {
	if (!span?.first || !span.last) return null;
	return span.first === span.last ? span.first : `${span.first} → ${span.last}`;
}

function renderHeader(entry: DevEntryFile, project: string, week: string) {
	const span = range(entry.versions) ?? range(entry.dates);
	const head = `**${project} · ${week}**`;
	return span ? `${head} · ${span}` : head;
}

function renderCounts(entry: DevEntryFile): string | null {
	const counts = SECTIONS.map(
		([key]) => [key, entry[key]?.length ?? 0] as const,
	)
		.filter(([, count]) => count > 0)
		.map(([key, count]) => `${count} ${key}`);
	return counts.length > 0 ? counts.join(" · ") : null;
}

function renderParent(entry: DevEntryFile, project: string, week: string) {
	const lines = [renderHeader(entry, project, week)];
	if (entry.title) lines.push(`**${entry.title}**`);
	const blocks = [lines.join("\n")];
	if (entry.lede) blocks.push(entry.lede);
	const counts = renderCounts(entry);
	if (counts) blocks.push(counts);
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
): string[] {
	const reply = renderReply(entry);
	const parent = renderParent(entry, project, week);
	return reply ? [parent, reply] : [parent];
}
