export const BEGIN_MARKER = "# >>> assist backup schedule >>>";
export const END_MARKER = "# <<< assist backup schedule <<<";

type ScheduleBlock = {
	every: string;
	cron: string;
};

function buildBlock(every: string, cronLine: string): string[] {
	return [BEGIN_MARKER, `# every ${every}`, cronLine, END_MARKER];
}

function findBlockRange(
	lines: string[],
): { start: number; end: number } | undefined {
	const start = lines.indexOf(BEGIN_MARKER);
	if (start === -1) return undefined;
	const end = lines.indexOf(END_MARKER, start);
	if (end === -1) return undefined;
	return { start, end };
}

/**
 * Insert or replace the marked assist-backup block in the given crontab text,
 * leaving every other line untouched. Re-running with a new cadence replaces the
 * existing block in place rather than appending a duplicate.
 */
export function upsertScheduleBlock(
	crontab: string,
	every: string,
	cronLine: string,
): string {
	const lines =
		crontab.length === 0 ? [] : crontab.replace(/\n$/, "").split("\n");
	const block = buildBlock(every, cronLine);
	const range = findBlockRange(lines);

	const next =
		range === undefined
			? [...lines, ...block]
			: [
					...lines.slice(0, range.start),
					...block,
					...lines.slice(range.end + 1),
				];

	return `${next.join("\n")}\n`;
}

/** Remove the marked assist-backup block, preserving all other crontab lines. */
export function removeScheduleBlock(crontab: string): string {
	const lines =
		crontab.length === 0 ? [] : crontab.replace(/\n$/, "").split("\n");
	const range = findBlockRange(lines);
	if (range === undefined) return crontab;

	const next = [...lines.slice(0, range.start), ...lines.slice(range.end + 1)];
	return next.length === 0 ? "" : `${next.join("\n")}\n`;
}

/** Read the cadence and cron expression from the marked block, if present. */
export function readScheduleBlock(crontab: string): ScheduleBlock | undefined {
	const lines = crontab.length === 0 ? [] : crontab.split("\n");
	const range = findBlockRange(lines);
	if (range === undefined) return undefined;

	const body = lines.slice(range.start + 1, range.end);
	const everyLine = body.find((line) => line.startsWith("# every "));
	const cronLine = body.find(
		(line) => !line.startsWith("#") && line.trim() !== "",
	);
	if (everyLine === undefined || cronLine === undefined) return undefined;

	const every = everyLine.slice("# every ".length).trim();
	const cron = cronLine.trim().split(/\s+/).slice(0, 5).join(" ");
	return { every, cron };
}
