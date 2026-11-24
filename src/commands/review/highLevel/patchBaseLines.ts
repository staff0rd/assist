const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)/;

type PatchBaseLines = {
	removed: Set<number>;
	toHead: (line: number) => number;
};

export function patchBaseLines(patch: string): PatchBaseLines {
	const removed = new Set<number>();
	const mapped = new Map<number, number>();
	const hunkEnds: { base: number; head: number }[] = [];
	let base = 0;
	let head = 0;
	const closeHunk = () => {
		if (base > 0 || head > 0) hunkEnds.push({ base, head });
	};
	for (const line of patch.split("\n")) {
		const header = HUNK_HEADER.exec(line);
		if (header) {
			closeHunk();
			base = Number(header[1]);
			head = Number(header[2]);
		} else if (line.startsWith("\\")) continue;
		else if (line.startsWith("+")) head++;
		else if (line.startsWith("-")) {
			removed.add(base);
			mapped.set(base++, head);
		} else mapped.set(base++, head++);
	}
	closeHunk();
	const toHead = (line: number): number => {
		const exact = mapped.get(line);
		if (exact !== undefined) return exact;
		const before = [...hunkEnds].reverse().find((end) => end.base <= line);
		return before ? line + before.head - before.base : line;
	};
	return { removed, toHead };
}
