type Paragraph = { section: string; lines: string[] };

const MAX_PARAGRAPH_CHARS = 600;

const MAX_PARAGRAPH_SENTENCES = 4;

export function findWallOfText(
	body: string,
): { section: string; chars: number } | undefined {
	const wall = splitParagraphs(body).find((p) => isWallOfText(p.lines));
	if (!wall) {
		return undefined;
	}
	return { section: wall.section, chars: wall.lines.join(" ").trim().length };
}

function splitParagraphs(body: string): Paragraph[] {
	const paragraphs: Paragraph[] = [];
	let section = "(intro)";
	let lines: string[] = [];

	const flush = () => {
		if (lines.length > 0) {
			paragraphs.push({ section, lines });
			lines = [];
		}
	};

	for (const line of body.split("\n")) {
		const heading = line.match(/^#{1,6}\s+(.*)$/);
		if (heading) {
			flush();
			section = heading[1].trim();
		} else if (line.trim() === "") {
			flush();
		} else {
			lines.push(line);
		}
	}
	flush();

	return paragraphs;
}

function isWallOfText(lines: string[]): boolean {
	if (lines.some(isListLine)) {
		return false;
	}
	const text = lines.join(" ").trim();
	return (
		text.length > MAX_PARAGRAPH_CHARS ||
		countSentences(text) > MAX_PARAGRAPH_SENTENCES
	);
}

function countSentences(paragraph: string): number {
	return paragraph.match(/[.!?]+(\s|$)/g)?.length ?? 0;
}

function isListLine(line: string): boolean {
	return /^\s*([-*+]|\d+[.)])\s/.test(line);
}
