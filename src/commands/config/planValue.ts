import { isDeepStrictEqual } from "node:util";
import {
	diffRepoConfigLeaves,
	type RepoConfigLeafChange,
} from "./diffRepoConfigLeaves";
import { getNestedValue } from "./getNestedValue";
import { setNestedValue } from "./setNestedValue";

export function planValue(
	merged: Record<string, unknown>,
	key: string,
	incoming: unknown,
): { merged: Record<string, unknown>; changes: RepoConfigLeafChange[] } {
	if (Array.isArray(incoming)) return planArray(merged, key, incoming);
	const changes = diffRepoConfigLeaves(
		merged,
		setNestedValue({}, key, incoming),
	);
	return {
		merged: changes.reduce(
			(acc, change) => setNestedValue(acc, change.key, change.to),
			merged,
		),
		changes,
	};
}

function planArray(
	merged: Record<string, unknown>,
	key: string,
	incoming: unknown[],
): { merged: Record<string, unknown>; changes: RepoConfigLeafChange[] } {
	const current = getNestedValue(merged, key);
	const existing = Array.isArray(current) ? current : [];
	const added = incoming.filter(
		(item) => !existing.some((entry) => isDeepStrictEqual(entry, item)),
	);
	if (added.length === 0) return { merged, changes: [] };
	return {
		merged: setNestedValue(merged, key, [...existing, ...added]),
		changes: added.map((to) => ({ key: `${key}[]`, to })),
	};
}
