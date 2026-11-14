const MAX_LINE = 80;

export function activityLine(text: string): string {
	const line = text.trim().split("\n")[0].trim();
	return line.length > MAX_LINE ? `${line.slice(0, MAX_LINE - 1)}…` : line;
}
