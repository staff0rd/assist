import { replaceConfigListItem } from "../../moveConfigListItem";

export type ConfigArrayItemPlacement =
	| { kind: "replace" | "insert"; index: number }
	| undefined;

export function placeConfigArrayItem(
	items: unknown[],
	placement: ConfigArrayItemPlacement,
	value: unknown,
): unknown[] {
	if (!placement || placement.index < 0) return [...items, value];
	if (placement.kind === "insert")
		return [
			...items.slice(0, placement.index),
			value,
			...items.slice(placement.index),
		];
	if (placement.index >= items.length) return [...items, value];
	return replaceConfigListItem(items, placement.index, value);
}
