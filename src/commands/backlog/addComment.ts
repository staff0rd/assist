import type { BacklogComment, BacklogItem } from "./types";

export function addComment(
	item: BacklogItem,
	text: string,
	phase?: number,
): void {
	const entry: BacklogComment = {
		text,
		timestamp: new Date().toISOString(),
		type: "comment",
		...(phase !== undefined && { phase }),
	};
	if (!item.comments) item.comments = [];
	item.comments.push(entry);
}

export function addPhaseSummary(
	item: BacklogItem,
	text: string,
	phase: number,
): void {
	const entry: BacklogComment = {
		text,
		phase,
		timestamp: new Date().toISOString(),
		type: "summary",
	};
	if (!item.comments) item.comments = [];
	item.comments.push(entry);
}
