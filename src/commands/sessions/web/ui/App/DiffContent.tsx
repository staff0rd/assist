import { diffBodyProps } from "./DiffContent/diffBodyProps";
import { DiffContentBody } from "./DiffContent/DiffContentBody";
import { DiffSnackbars } from "./DiffContent/DiffSnackbars";
import { DiffToolbar } from "./DiffContent/DiffToolbar";
import type { DiffPanelMode } from "./toggleDiffPanel";
import type { SessionInfo } from "../types";
import { useDiffContent } from "./DiffContent/useDiffContent";

export function DiffContent({
	cwd,
	sessionId,
	scope,
	onScopeChange,
	sessions,
	sendInput,
	mode,
	onToggleMode,
	onClose,
}: {
	cwd: string;
	sessionId?: string;
	scope: string;
	onScopeChange: (scope: string) => void;
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	onClose?: () => void;
}) {
	const diff = useDiffContent(cwd, sessionId, scope, sessions, sendInput);

	return (
		<>
			<DiffToolbar
				{...diff.filters}
				{...diff.treePanel}
				{...diff.collapseAll}
				scope={diff.scopeState}
				onScopeChange={onScopeChange}
				totals={diff.totals}
				commentHint={diff.comments.unavailable}
				mode={mode}
				onToggleMode={onToggleMode}
				onClose={onClose}
			/>
			<DiffContentBody {...diffBodyProps(diff, cwd)} />
			<DiffSnackbars
				sentTo={diff.comments.sentTo}
				clearSent={diff.comments.clearSent}
				revertError={diff.revert.error}
				clearRevertError={diff.revert.clearError}
			/>
		</>
	);
}
