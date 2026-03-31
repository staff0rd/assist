import type { BacklogComment } from "./types";

export function buildCommentLines(
	comments: BacklogComment[] | undefined,
): string[] {
	if (!comments?.length) return [];
	return ["", "Comments:", ...comments.map(formatPromptComment)];
}

function formatPromptComment(entry: BacklogComment): string {
	const tag = entry.type === "summary" ? "[summary]" : "[comment]";
	const phase = entry.phase !== undefined ? ` (phase ${entry.phase + 1})` : "";
	return `${tag}${phase} ${entry.timestamp}\n  ${entry.text}`;
}
