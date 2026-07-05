function blankNonNewline(text: string): string {
	return text.replace(/[^\n]/g, " ");
}

export function extractYamlComments(text: string): string[] {
	const work = text.replace(
		/"(?:[^"\\]|\\.)*"|'(?:[^']|'')*'/g,
		blankNonNewline,
	);

	const comments: string[] = [];
	for (const match of work.matchAll(/(?:^|\s)(#.*)/gm)) {
		comments.push(match[1]);
	}

	return comments
		.map((comment) => comment.replace(/\s+/g, " ").trim())
		.filter((comment) => comment.length > 0);
}
