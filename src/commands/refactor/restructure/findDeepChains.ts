import path from "node:path";

type ChainFolder = { name: string; files: number };

export type DeepChain = {
	folders: ChainFolder[];
	tooDeep: number;
	deepest: number;
};

function dirSegments(target: string, scopeRoot: string): string[] {
	const dir = path.relative(scopeRoot, path.dirname(target));
	return dir === "" ? [] : dir.split(path.sep);
}

function countSubtrees(segmentLists: string[][]): Map<string, number> {
	const counts = new Map<string, number>();
	for (const segments of segmentLists)
		for (let i = 1; i <= segments.length; i++) {
			const key = segments.slice(0, i).join("/");
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	return counts;
}

export function findDeepChains(
	targets: Iterable<string>,
	scopeRoot: string,
	maxDepth: number,
): DeepChain[] {
	const segmentLists = [...targets].map((t) => dirSegments(t, scopeRoot));
	const subtreeFiles = countSubtrees(segmentLists);
	const chains = new Map<string, DeepChain>();
	for (const segments of segmentLists) {
		if (segments.length <= maxDepth) continue;
		const head = segments.slice(0, maxDepth + 1);
		const key = head.join("/");
		const chain = chains.get(key) ?? {
			folders: head.map((name, i) => ({
				name,
				files: subtreeFiles.get(head.slice(0, i + 1).join("/")) ?? 0,
			})),
			tooDeep: 0,
			deepest: 0,
		};
		chain.tooDeep += 1;
		chain.deepest = Math.max(chain.deepest, segments.length);
		chains.set(key, chain);
	}
	return [...chains.entries()]
		.sort(([ka, a], [kb, b]) => b.tooDeep - a.tooDeep || ka.localeCompare(kb))
		.map(([, chain]) => chain);
}
