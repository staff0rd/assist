import path from "node:path";

type DepthStats = { max: number; distribution: Map<number, number> };

export function computeDepthStats(
	targets: Iterable<string>,
	scopeRoot: string,
): DepthStats {
	const distribution = new Map<number, number>();
	let max = 0;
	for (const target of targets) {
		const dir = path.relative(scopeRoot, path.dirname(target));
		const depth = dir === "" ? 0 : dir.split(path.sep).length;
		distribution.set(depth, (distribution.get(depth) ?? 0) + 1);
		max = Math.max(max, depth);
	}
	return { max, distribution };
}
