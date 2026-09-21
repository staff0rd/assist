type CappedPatch = {
	patch?: string;
	truncated: boolean;
};

function hunksOf(patch: string): string[] {
	const hunks: string[] = [];
	for (const line of patch.split("\n")) {
		const last = hunks[hunks.length - 1];
		if (line.startsWith("@@") || last === undefined) hunks.push(line);
		else hunks[hunks.length - 1] = `${last}\n${line}`;
	}
	return hunks;
}

export function capPatchToBudget(patch: string, budget: number): CappedPatch {
	const kept: string[] = [];
	let lines = 0;
	for (const hunk of hunksOf(patch)) {
		const size = hunk.split("\n").length;
		if (lines + size > budget)
			return {
				...(kept.length > 0 ? { patch: kept.join("\n") } : {}),
				truncated: true,
			};
		kept.push(hunk);
		lines += size;
	}
	return { patch, truncated: false };
}
