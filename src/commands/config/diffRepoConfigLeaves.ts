import { isDeepStrictEqual } from "node:util";

export type RepoConfigLeafChange = {
	key: string;
	from?: unknown;
	to: unknown;
};

export function diffRepoConfigLeaves(
	current: Record<string, unknown>,
	incoming: Record<string, unknown>,
): RepoConfigLeafChange[] {
	const existing = new Map(leaves(current));
	return leaves(incoming).flatMap(([key, to]) => {
		if (!existing.has(key)) return [{ key, to }];
		const from = existing.get(key);
		return isDeepStrictEqual(from, to) ? [] : [{ key, from, to }];
	});
}

function leaves(
	node: Record<string, unknown>,
	prefix = "",
): [string, unknown][] {
	return Object.entries(node).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		return isPlainObject(value) && Object.keys(value).length > 0
			? leaves(value, path)
			: [[path, value] as [string, unknown]];
	});
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
