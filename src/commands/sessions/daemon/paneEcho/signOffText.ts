import type { PrPreviewComment } from "../../shared/SessionInfoBase";

function isComment(value: unknown): value is PrPreviewComment {
	const c = value as Partial<PrPreviewComment> | null;
	return typeof c?.quote === "string" && typeof c.note === "string";
}

function formatComment({ quote, note }: PrPreviewComment): string {
	const excerpt = quote
		.split("\n")
		.map((line) => `> ${line}`)
		.join("\n");
	return `${excerpt}\n\n${note.trim()}`;
}

export function signOffText(d: Record<string, unknown>): string {
	const reason = typeof d.reason === "string" ? d.reason.trim() : "";
	const comments = Array.isArray(d.comments)
		? d.comments.filter(isComment).filter((c) => c.note.trim())
		: [];
	return [...(reason ? [reason] : []), ...comments.map(formatComment)].join(
		"\n\n",
	);
}
