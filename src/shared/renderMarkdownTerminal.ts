import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

export function renderMarkdownTerminal(text: string): string {
	const width = process.stdout.columns || 80;
	const marked = new Marked(markedTerminal({ width, reflowText: true }));
	marked.use({
		renderer: {
			text(token) {
				if (
					token &&
					typeof token === "object" &&
					"tokens" in token &&
					token.tokens
				) {
					return this.parser.parseInline(token.tokens);
				}
				return false;
			},
		},
	});
	return (marked.parse(text) as string).trimEnd();
}
