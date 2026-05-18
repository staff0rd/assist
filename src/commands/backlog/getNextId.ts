import type { BacklogFile } from "./types";

export function getNextId(items: BacklogFile): number {
	if (items.length === 0) return 1;
	return Math.max(...items.map((item) => item.id)) + 1;
}
