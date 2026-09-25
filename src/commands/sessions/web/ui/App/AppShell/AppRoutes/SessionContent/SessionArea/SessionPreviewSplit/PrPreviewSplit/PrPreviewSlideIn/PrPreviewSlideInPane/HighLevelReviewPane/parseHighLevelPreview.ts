import type {
	HighLevelCheckResult,
	HighLevelPreviewPayload,
} from "../../../../../../../../../../../../../review/highLevel/types";

const EMPTY: HighLevelPreviewPayload = {
	repo: "",
	prNumber: 0,
	checks: [],
	structure: {
		tree: [],
		added: 0,
		removed: 0,
		modified: 0,
		additions: 0,
		deletions: 0,
	},
	criticalDiffs: [],
	criticalPaths: [],
};

function isCheck(value: unknown): value is HighLevelCheckResult {
	const check = value as HighLevelCheckResult | undefined;
	return (
		typeof check?.id === "string" &&
		typeof check.title === "string" &&
		typeof check.reason === "string" &&
		(check.kind === "deterministic" || check.kind === "manual") &&
		["pass", "fail", "manual"].includes(check.status)
	);
}

function asArray<T>(value: unknown, guard?: (item: unknown) => item is T): T[] {
	if (!Array.isArray(value)) return [];
	return guard ? value.filter(guard) : (value as T[]);
}

export function parseHighLevelPreview(body: string): HighLevelPreviewPayload {
	let parsed: Partial<HighLevelPreviewPayload>;
	try {
		parsed = JSON.parse(body) as Partial<HighLevelPreviewPayload>;
	} catch {
		return EMPTY;
	}
	if (typeof parsed !== "object" || parsed === null) return EMPTY;
	return {
		repo: typeof parsed.repo === "string" ? parsed.repo : EMPTY.repo,
		prNumber:
			typeof parsed.prNumber === "number" ? parsed.prNumber : EMPTY.prNumber,
		checks: asArray(parsed.checks, isCheck),
		structure: { ...EMPTY.structure, ...parsed.structure },
		criticalDiffs: asArray(parsed.criticalDiffs),
		criticalPaths: asArray(parsed.criticalPaths),
		...(parsed.saved ? { saved: parsed.saved } : {}),
	};
}
