function blankNonNewline(text: string): string {
	return text.replace(/[^\n]/g, " ");
}

const STRING_LITERAL = /'''[\s\S]*?'''|'(?:[^'\\]|\\.)*'/g;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*[/]/g;
const LINE_COMMENT = /\/\/.*/;

export function collectBicepComments(
	content: string,
): { line: number; text: string }[] {
	let work = content.replace(STRING_LITERAL, blankNonNewline);

	const comments: { line: number; text: string }[] = [];

	work = work.replace(BLOCK_COMMENT, (match, offset: number) => {
		const line = content.slice(0, offset).split("\n").length;
		comments.push({ line, text: match });
		return blankNonNewline(match);
	});

	const lines = work.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(LINE_COMMENT);
		if (match) comments.push({ line: i + 1, text: match[0] });
	}

	return comments;
}
