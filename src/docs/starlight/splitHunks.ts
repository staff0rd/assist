import { matchKeys } from "./matchKeys";

type Hunk<B> = { oldBlocks: B[]; newBlocks: B[]; previous?: B };

export function splitHunks<B extends { key: string }>(
	oldBlocks: B[],
	newBlocks: B[],
): Hunk<B>[] {
	const pairs = matchKeys(
		oldBlocks.map((block) => block.key),
		newBlocks.map((block) => block.key),
	);
	const hunks: Hunk<B>[] = [];
	let oldStart = 0;
	let newStart = 0;
	for (const [oldEnd, newEnd] of [
		...pairs,
		[oldBlocks.length, newBlocks.length],
	]) {
		hunks.push({
			oldBlocks: oldBlocks.slice(oldStart, oldEnd),
			newBlocks: newBlocks.slice(newStart, newEnd),
			previous: newBlocks[newStart - 1],
		});
		oldStart = oldEnd + 1;
		newStart = newEnd + 1;
	}
	return hunks.filter(
		(hunk) => hunk.oldBlocks.length > 0 || hunk.newBlocks.length > 0,
	);
}
