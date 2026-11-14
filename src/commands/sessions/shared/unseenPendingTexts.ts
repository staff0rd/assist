type TranscriptRole = { role: string; text?: string };

function latestUserTexts(rows: TranscriptRole[]): string[] {
	const texts: string[] = [];
	for (let i = rows.length - 1; i >= 0; i--) {
		const row = rows[i];
		if (row.role === "user" && row.text !== undefined) texts.push(row.text);
		else if (row.role === "assistant" && texts.length) break;
	}
	return texts;
}

/* why: a pending message is shown before Claude writes it to the transcript,
 * so it is dropped once the transcript's latest user rows contain its text. */
export function unseenPendingTexts(
	pending: string[] | undefined,
	rows: TranscriptRole[],
): string[] {
	if (!pending?.length) return [];
	const seen = latestUserTexts(rows);
	return pending.filter((text) => !seen.some((t) => t.includes(text.trim())));
}
