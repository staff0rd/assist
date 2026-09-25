import { countRender, renderHudEnabled } from "../../../renderCounters";

const previous = new Map<string, Record<string, unknown>>();

export function trackChangedValues(
	label: string,
	values: Record<string, unknown>,
): void {
	if (!renderHudEnabled()) return;
	const last = previous.get(label);
	previous.set(label, values);
	if (!last) return;
	for (const [key, value] of Object.entries(values))
		if (!Object.is(value, last[key])) countRender(`Δ ${label}.${key}`);
}
