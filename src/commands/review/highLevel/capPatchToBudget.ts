import { hunksOf } from "./hunksOf";

type CappedPatch = {
	patch?: string;
	truncated: boolean;
};

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
