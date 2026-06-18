import type { MenuItem } from "./menuItems";

export function nextIndex(
	items: MenuItem[],
	current: number,
	direction: 1 | -1,
): number {
	const n = items.length;
	if (n === 0) return current;
	return (current + direction + n) % n;
}

export function firstEnabledIndex(items: MenuItem[]): number {
	const idx = items.findIndex((item) => !item.disabled);
	return idx === -1 ? 0 : idx;
}
