import type { BacklogFile } from "./types";

export function hasCycle(
	items: BacklogFile,
	fromId: number,
	toId: number,
): boolean {
	const visited = new Set<number>();
	const stack = [toId];
	while (stack.length > 0) {
		const current = stack.pop() as number;
		if (current === fromId) return true;
		if (visited.has(current)) continue;
		visited.add(current);
		const item = items.find((i) => i.id === current);
		if (!item?.links) continue;
		for (const link of item.links) {
			if (link.type === "depends-on") {
				stack.push(link.targetId);
			}
		}
	}
	return false;
}
