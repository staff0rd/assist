import type { HighLevelHunk } from "./listHighLevelHunks";
import { parseHighLevelSlicesInput } from "./parseHighLevelSlicesInput";
import { withTestRegrouping } from "./withTestRegrouping";
import { sliceTotals } from "./sliceTotals";
import type {
	HighLevelSlice,
	HighLevelSliceSet,
	HighLevelTestFile,
} from "./types";
import { knownRefs } from "./knownRefs";

type ResolvedSlices = HighLevelSliceSet & { warnings: string[] };

export function resolveHighLevelSlices(
	raw: unknown,
	hunks: HighLevelHunk[],
	tests: HighLevelTestFile[] = [],
): ResolvedSlices {
	const byRef = new Map(hunks.map((hunk) => [hunk.ref, hunk]));
	const claimed = new Set<string>();
	const warnings: string[] = [];
	const slices: HighLevelSlice[] = [];
	const add = (title: string, summary: string, refs: string[]) =>
		slices.push({ title, summary, hunks: refs, ...sliceTotals(refs, byRef) });
	const {
		slices: inputs,
		manualTesting,
		tests: regrouping,
	} = parseHighLevelSlicesInput(raw);
	for (const input of inputs) {
		const known = knownRefs(input, byRef, warnings);
		if (known.length === 0)
			warnings.push(`Dropped slice "${input.title}": it has no known hunks.`);
		else add(input.title, input.summary, known);
		for (const ref of known) claimed.add(ref);
	}
	const rest = [...byRef.keys()].filter((ref) => !claimed.has(ref));
	if (rest.length > 0)
		slices.push({
			title: "Everything else",
			summary: "Hunks no slice claimed.",
			hunks: rest,
			...sliceTotals(rest, byRef),
			rest: true,
		});
	return {
		slices,
		...(manualTesting ? { manualTesting } : {}),
		...withTestRegrouping(regrouping, tests, warnings),
		warnings,
	};
}
