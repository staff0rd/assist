import type { BacklogComment } from "./types";

export function buildCommentLines(
	comments: BacklogComment[] | undefined,
): string[] {
	if (!comments?.length) return [];
	return ["", "Comments:", ...comments.map(formatPromptComment)];
}

function formatPromptComment(entry: BacklogComment): string {
	const id = entry.id !== undefined ? `#${entry.id} ` : "";
	const tag = entry.type === "summary" ? "[summary]" : "[comment]";
	const phase = entry.phase !== undefined ? ` (phase ${entry.phase})` : "";
	return `${id}${tag}${phase} ${entry.timestamp}\n  ${entry.text}`;
}
