import { collapseAllState } from "./useDiffContent/collapseAllState";
import { diffEmptyMessage } from "./useDiffContent/diffEmptyMessage";
import { diffFileTotals } from "./diffFileTotals";
import { filePath } from "./FileDiff";
import type { SessionInfo } from "../../types";
import { useActiveDiffFile } from "./useDiffContent/useActiveDiffFile";
import { useCollapsedFiles } from "./useDiffContent/useCollapsedFiles";
import { useConversationDiff } from "./useDiffContent/useConversationDiff";
import { useDiffComments } from "./useDiffContent/useDiffComments";
import type { DiffCommentSource } from "./useDiffContent/useDiffComments/diffCommentTarget";
import { useDiffFileData } from "./useDiffContent/useDiffFileData";
import { useDiffFilters } from "./useDiffContent/useDiffFilters";
import { useDiffTreePanel } from "./useDiffContent/useDiffTreePanel";

export function useDiffContent(
	cwd: string,
	source: DiffCommentSource,
	scope: string,
	sessions: SessionInfo[],
	sendInput: (sessionId: string, data: string) => void,
) {
	const { scopeState, diff, loading, error, revert, uncommittedFiles } =
		useConversationDiff(cwd, source.conversation, scope);
	const filters = useDiffFilters();
	const treePanel = useDiffTreePanel();
	const comments = useDiffComments(sessions, source, sendInput);
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
		uncommittedFiles,
		collapseAll: collapseAllState(visiblePaths, collapsedFiles),
		visibleFiles,
		totals: diffFileTotals(visibleFiles),
		emptyMessage: diffEmptyMessage(error, files.length),
	};
}
