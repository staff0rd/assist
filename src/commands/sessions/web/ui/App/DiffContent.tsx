import type { ConversationTarget } from "../../../shared/sessionConversationTarget";
import {
	DiffClosableLayout,
	type DiffScrollRegionProps,
} from "./DiffContent/DiffClosableLayout";
import { ExpandableDiffContentBody } from "./DiffContent/ExpandableDiffContentBody";
import { DiffSnackbars } from "./DiffContent/DiffSnackbars";
import { DiffToolbar } from "./DiffContent/DiffToolbar";
import { diffToolbarState } from "./DiffContent/diffToolbarState";
import type { DiffPanelMode } from "./toggleDiffPanel";
import type { SessionInfo } from "../types";
import { useDiffContent } from "./DiffContent/useDiffContent";

export function DiffContent({
	cwd,
	ownerSessionId,
	conversation,
	scope,
	onScopeChange,
	sessions,
	sendInput,
	mode,
	onToggleMode,
	onClose,
	scrollRegionProps,
}: {
	cwd: string;
	ownerSessionId?: string;
	conversation?: ConversationTarget;
	scope: string;
	onScopeChange: (scope: string) => void;
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	onClose?: () => void;
	scrollRegionProps?: DiffScrollRegionProps;
}) {
	const diff = useDiffContent(
		cwd,
		{ ownerSessionId, conversation },
		scope,
		sessions,
		sendInput,
	);

	return (
		<>
			<DiffClosableLayout
				onClose={onClose}
				scrollRegionProps={scrollRegionProps}
			>
				<DiffToolbar
					{...diffToolbarState(diff)}
					onScopeChange={onScopeChange}
					mode={mode}
					onToggleMode={onToggleMode}
					onClose={onClose}
				/>
				<ExpandableDiffContentBody diff={diff} cwd={cwd} />
			</DiffClosableLayout>
			<DiffSnackbars
				sentTo={diff.comments.sentTo}
				clearSent={diff.comments.clearSent}
				revertError={diff.revert.error}
				clearRevertError={diff.revert.clearError}
			/>
		</>
	);
}
