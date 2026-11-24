const WRAP_WIDTH = 100;
const MAX_SHORT_LINES = 2;

export function isLongReply(text: string): boolean {
	const lines = text
		.split("\n")
		.filter((line) => line.trim())
		.reduce((count, line) => count + Math.ceil(line.length / WRAP_WIDTH), 0);
	return lines > MAX_SHORT_LINES;
}
