import { splitHunks } from "./splitHunks";

export type DiffBlock<T> = {
	key: string;
	node: T;
	container?: string;
	children?: DiffBlock<T>[];
};

type RemovedBlocks<T> = {
	nodes: T[];
	before?: T;
	after?: T;
	parent?: T;
};

export type BlockDiff<T> = { added: T[]; removed: RemovedBlocks<T>[] };

function collectDiff<T>(
	oldBlocks: DiffBlock<T>[],
	newBlocks: DiffBlock<T>[],
	parent: T | undefined,
	diff: BlockDiff<T>,
): void {
	for (const hunk of splitHunks(oldBlocks, newBlocks)) {
		const unpaired = [...hunk.oldBlocks];
		for (const block of hunk.newBlocks) {
			const index = block.container
				? unpaired.findIndex((old) => old.container === block.container)
				: -1;
			if (index === -1) diff.added.push(block.node);
			else
				collectDiff(
					unpaired.splice(index, 1)[0].children ?? [],
					block.children ?? [],
					block.node,
					diff,
				);
		}
		if (unpaired.length === 0) continue;
		const nodes = unpaired.map((block) => block.node);
		const [first] = hunk.newBlocks;
		if (first) diff.removed.push({ nodes, before: first.node });
		else if (hunk.previous)
			diff.removed.push({ nodes, after: hunk.previous.node });
		else diff.removed.push({ nodes, parent });
	}
}

export function diffBlocks<T>(
	oldBlocks: DiffBlock<T>[],
	newBlocks: DiffBlock<T>[],
): BlockDiff<T> {
	const diff: BlockDiff<T> = { added: [], removed: [] };
	collectDiff(oldBlocks, newBlocks, undefined, diff);
	return diff;
}
