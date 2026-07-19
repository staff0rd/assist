function blankNonNewline(text: string): string {
	return text.replace(/[^\n]/g, " ");
}

function isHeaderLine(line: string): boolean {
	const trimmed = line.trim();
	return trimmed === "" || trimmed.startsWith("#");
}

export function collectHashComments(
	content: string,
	options: { skipHeader: boolean },
): { line: number; text: string }[] {
	const lines = content.split("\n");

	let start = 0;
	if (options.skipHeader) {
		while (start < lines.length && isHeaderLine(lines[start])) start++;
	}

	const comments: { line: number; text: string }[] = [];
	for (let i = start; i < lines.length; i++) {
		const work = lines[i].replace(
			/"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'/g,
			blankNonNewline,
		);
		const match = work.match(/(?:^|\s)(#.*)/);
		if (match) comments.push({ line: i + 1, text: match[1] });
	}
	return comments;
}
