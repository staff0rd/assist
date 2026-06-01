import { readFileSync } from "node:fs";
import { type BacklogItem, backlogItemSchema } from "./types";

/**
 * Parse a line-delimited JSON backlog export (`.assist/backlog.jsonl`) into
 * validated items. Each non-empty line is one item; malformed lines throw.
 */
export function parseBacklogJsonl(path: string): BacklogItem[] {
	const content = readFileSync(path, "utf-8").trim();
	if (content.length === 0) return [];
	return content
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => backlogItemSchema.parse(JSON.parse(line)));
}
