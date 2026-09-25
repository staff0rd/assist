export function moveConfigListItem(
	items: unknown[],
	from: number,
	to: number,
): unknown[] {
	if (to < 0 || to >= items.length) return items;
	const out = [...items];
	const [moved] = out.splice(from, 1);
	out.splice(to, 0, moved);
	return out;
}

export function replaceConfigListItem(
	items: unknown[],
	index: number,
	value: unknown,
): unknown[] {
	return items.map((item, at) => (at === index ? value : item));
}

export function removeConfigListItem(
	items: unknown[],
	index: number,
): unknown[] {
	return items.filter((_item, at) => at !== index);
}
