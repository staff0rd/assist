import { collapseAllState } from "./useDiffContent/collapseAllState";
import { diffEmptyMessage } from "./useDiffContent/diffEmptyMessage";
import { diffFileTotals } from "./diffFileTotals";
import { filePath } from "./FileDiff";
import type { SessionInfo } from "../../../../types";
import { useActiveDiffFile } from "./useDiffContent/useActiveDiffFile";
import { useCollapsedFiles } from "./useDiffContent/useCollapsedFiles";
import { useDiff } from "./useDiffContent/useDiff";
import { useDiffComments } from "./useDiffContent/useDiffComments";
import { useDiffFileData } from "./useDiffContent/useDiffFileData";
import { useDiffFilters } from "./useDiffContent/useDiffFilters";
import { useDiffRevert } from "./useDiffContent/useDiffRevert";
import { useDiffScopeState } from "./useDiffScopeState";
import { useDiffTreePanel } from "./useDiffContent/useDiffTreePanel";

export function useDiffContent(
	cwd: string,
	sessionId: string | undefined,
	scope: string,
	sessions: SessionInfo[],
	sendInput: (sessionId: string, data: string) => void,
) {
	const scopeState = useDiffScopeState(cwd, sessionId, scope);
	const { diff, loading, error, refresh } = useDiff(
		cwd,
		sessionId,
		scopeState.scope,
	);
	const revert = useDiffRevert(
		cwd,
		scopeState.scope === "uncommitted",
		refresh,
	);
	const filters = useDiffFilters();
	const treePanel = useDiffTreePanel();
	const comments = useDiffComments(sessions, sessionId, sendInput);
	const collapsedFiles = useCollapsedFiles(cwd);
	const { files, visibleFiles } = useDiffFileData({
		diff,
		error,
		search: filters.search,
		changeType: filters.changeType,
	});

	const visiblePaths = visibleFiles.map((file) => filePath(file));
	const activeFile = useActiveDiffFile(
		treePanel.treeVisible ? visiblePaths : [],
	);
	return {
		scopeState,
		loading,
		filters,
		treePanel,
		comments,
		collapsedFiles,
		activeFile,
		revert,
		collapseAll: collapseAllState(visiblePaths, collapsedFiles),
		visibleFiles,
		totals: diffFileTotals(visibleFiles),
		emptyMessage: diffEmptyMessage(error, files.length),
	};
}
