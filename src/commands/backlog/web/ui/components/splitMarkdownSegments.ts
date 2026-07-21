import { type Token, type TokensList, marked } from "marked";

type MarkdownSegment =
	| { type: "html"; key: string; html: string }
	| { type: "mermaid"; key: string; source: string };

export function splitMarkdownSegments(content: string): MarkdownSegment[] {
	const tokens = marked.lexer(content);
	const segments: MarkdownSegment[] = [];
	let buffer: Token[] = [];
	let index = 0;

	const flushHtml = () => {
		if (buffer.length === 0) return;
		const slice = Object.assign([...buffer], {
			links: tokens.links,
		}) as TokensList;
		segments.push({
			type: "html",
			key: `md-${index}`,
			html: marked.parser(slice) as string,
		});
		index += 1;
		buffer = [];
	};

	for (const token of tokens) {
		if (token.type === "code" && isMermaidLang(token.lang)) {
			flushHtml();
			segments.push({
				type: "mermaid",
				key: `mermaid-${index}`,
				source: token.text,
			});
			index += 1;
		} else {
			buffer.push(token);
		}
	}
	flushHtml();
	return segments;
}

function isMermaidLang(lang: string | undefined): boolean {
	return lang?.trim().split(/\s+/)[0].toLowerCase() === "mermaid";
}
