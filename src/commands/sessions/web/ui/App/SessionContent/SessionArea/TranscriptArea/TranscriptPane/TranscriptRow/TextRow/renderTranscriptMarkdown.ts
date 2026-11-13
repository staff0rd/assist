import { Marked, type Tokens } from "marked";

const escapeHtml = (text: string) =>
	text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Transcript text can quote untrusted content (web pages, files), so raw HTML is shown as text rather than injected.
const markdown = new Marked({
	renderer: {
		html(token: Tokens.HTML | Tokens.Tag) {
			return escapeHtml(token.text);
		},
	},
});

export function renderTranscriptMarkdown(text: string): string {
	return markdown.parse(text) as string;
}
