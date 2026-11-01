import { useCallback } from "react";
import { diffRevertScope } from "./diffRevertScope";
import { useDiffRevert } from "./useDiffRevert";
import { useUncommittedFiles } from "./useUncommittedFiles";

export function useScopedDiffRevert(
	cwd: string,
	sessionId: string | undefined,
	scope: string,
	refreshDiff: () => void,
) {
	const enabled = diffRevertScope(scope);
	const uncommitted = useUncommittedFiles(
		cwd,
		sessionId,
		enabled.needsUncommittedFiles,
	);
	const refreshUncommitted = uncommitted.refresh;
	const refresh = useCallback(() => {
		refreshDiff();
		refreshUncommitted();
	}, [refreshDiff, refreshUncommitted]);
	const revert = useDiffRevert(cwd, enabled, refresh);
	return { revert, uncommittedFiles: uncommitted.files };
}
