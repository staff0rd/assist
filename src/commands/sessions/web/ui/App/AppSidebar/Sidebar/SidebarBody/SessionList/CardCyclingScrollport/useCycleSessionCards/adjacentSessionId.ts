export function adjacentSessionId(
	order: string[],
	activeId: string | null,
	direction: 1 | -1,
): string | null {
	if (order.length === 0) return null;
	const index = activeId === null ? -1 : order.indexOf(activeId);
	if (index === -1) return direction === 1 ? order[0]! : order.at(-1)!;
	return order[(index + direction + order.length) % order.length]!;
}
