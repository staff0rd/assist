import { BRANCH_DIFF_SCOPE, DEFAULT_DIFF_SCOPE } from "../../diffScopeOptions";

const MIXED_SCOPES = new Set([DEFAULT_DIFF_SCOPE, BRANCH_DIFF_SCOPE]);

export function diffRevertScope(scope: string): {
	file: boolean;
	paths: boolean;
	needsUncommittedFiles: boolean;
} {
	const uncommitted = scope === "uncommitted";
	const mixed = MIXED_SCOPES.has(scope);
	return {
		file: uncommitted || mixed,
		paths: uncommitted || mixed,
		needsUncommittedFiles: mixed,
	};
}
