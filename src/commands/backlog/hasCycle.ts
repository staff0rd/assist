/**
 * Whether adding a `depends-on` edge from `fromId` to `toId` would create a
 * cycle, i.e. `toId` can already reach `fromId` by following existing
 * dependencies. `adjacency` maps an item id to the ids it depends on (see
 * {@link ./loadDependencyGraph}).
 */
export function hasCycle(
	adjacency: Map<number, number[]>,
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
		for (const target of adjacency.get(current) ?? []) {
			stack.push(target);
		}
	}
	return false;
}
