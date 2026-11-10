export function splitFileLines(content: string): string[] {
	const lines = content.split("\n");
	return lines.at(-1) === "" ? lines.slice(0, -1) : lines;
}
