import type { NextPickup } from "./types";

export function comparePickups(a: NextPickup, b: NextPickup): number {
	return (
		a.priorityRank - b.priorityRank || a.createdAt.localeCompare(b.createdAt)
	);
}
