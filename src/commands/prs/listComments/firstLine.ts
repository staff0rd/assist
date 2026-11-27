const summaryLimit = 100;

export function firstLine(body: string): string {
	const line = body.trim().split("\n")[0] ?? "";
	return line.length > summaryLimit
		? `${line.slice(0, summaryLimit - 1)}…`
		: line;
}
