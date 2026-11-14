import { parseRestartNudge } from "./parseRestartNudge";

type TranscriptRole = { role: string; text?: string };

function latestUserRows(rows: TranscriptRole[]) {
	const texts: string[] = [];
	let restart = false;
	for (let i = rows.length - 1; i >= 0; i--) {
		const row = rows[i];
		if (row.role === "user" && row.text !== undefined) texts.push(row.text);
		else if (row.role === "restart") restart = true;
		else if (row.role === "assistant" && (texts.length || restart)) break;
	}
	return { texts, restart };
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

/* why: a pending message is shown before Claude writes it to the transcript,
 * so it is dropped once the transcript's latest user rows contain its text.
 * A flushed queue is one pending entry joined with blank lines; whitespace is
 * collapsed so it still matches the single row Claude records for it. A
 * tagged restart nudge is recorded as a restart row with no text, so it
 * matches that row instead. */
export function unseenPendingTexts(
	pending: string[] | undefined,
	rows: TranscriptRole[],
): string[] {
	if (!pending?.length) return [];
	const latest = latestUserRows(rows);
	const seen = latest.texts.map(normalize);
	return pending.filter((text) =>
		parseRestartNudge(text) === null
			? !seen.some((t) => t.includes(normalize(text)))
			: !latest.restart,
	);
}
