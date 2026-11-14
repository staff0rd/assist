import { Marked, type Token, type Tokens } from "marked";
import { parsePrBody } from "../../../../../../../../prs/parsePrBody";
import { sectionMark } from "./sectionMark";
import { highlight } from "./highlight";
import { escapeHtml } from "./escapeHtml";

type IssueToken = Token & { issueRef?: string };

function containsReference(token: Token, reference: string): boolean {
	if (token.type === "link") return token.text.includes(reference);
	return (
		token.type === "text" && !token.tokens && token.text.includes(reference)
	);
}

// PR bodies are untrusted, so raw HTML is shown as text rather than injected.
export function renderDescriptionMarkdown(
	body: string,
	issueReference: string | null,
): string {
	const filled = new Set(
		parsePrBody(body)
			.filter((section) => section.content.trim() !== "")
			.map((section) => section.heading.trim().toLowerCase()),
	);
	let found = false;
	const markdown = new Marked({
		walkTokens(token) {
			if (found || !issueReference || !containsReference(token, issueReference))
				return;
			(token as IssueToken).issueRef = issueReference;
			found = true;
		},
		renderer: {
			html(token: Tokens.HTML | Tokens.Tag) {
				return escapeHtml(token.text);
			},
			heading({ tokens, depth, text }: Tokens.Heading) {
				const mark = depth === 2 ? sectionMark(text, filled) : "";
				if (!mark) return false;
				return `<h2>${this.parser.parseInline(tokens)} ${mark}</h2>\n`;
			},
			text(token: Tokens.Text | Tokens.Escape) {
				const { issueRef } = token as IssueToken;
				return issueRef ? highlight(token.text, issueRef) : false;
			},
			link(token: Tokens.Link) {
				const { issueRef } = token as IssueToken;
				if (!issueRef) return false;
				return `<a class="issue-ref" href="${escapeHtml(token.href)}">${this.parser.parseInline(token.tokens)}</a>`;
			},
		},
	});
	return markdown.parse(body) as string;
}
