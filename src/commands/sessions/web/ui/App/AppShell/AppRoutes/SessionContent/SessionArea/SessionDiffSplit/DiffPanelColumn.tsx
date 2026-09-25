import Box from "@mui/material/Box";
import { DiffContent } from "../../../DiffContent";
import type { DiffPanel } from "../../../toggleDiffPanel";
import type { SessionInfo } from "../../../../../../types";
import { useDiffPanels } from "../../../useDiffPanels";

const columnSx = {
	minWidth: 0,
	overflow: "auto",
	px: 1,
	borderColor: "divider",
} as const;

const halfSx = { ...columnSx, width: "50%", borderLeft: 1 } as const;
const fullSx = { ...columnSx, width: "100%" } as const;

export function DiffPanelColumn({
	sessionId,
	panel,
	sessions,
	sendInput,
}: {
	sessionId: string;
	panel: DiffPanel;
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
}) {
	const { closePanel, setPanelScope, togglePanelMode } = useDiffPanels();

	return (
		<Box sx={panel.mode === "full" ? fullSx : halfSx}>
			<DiffContent
				cwd={panel.cwd}
				sessionId={panel.claudeSessionId}
				scope={panel.scope}
				onScopeChange={(scope) => setPanelScope(sessionId, scope)}
				sessions={sessions}
				sendInput={sendInput}
				mode={panel.mode}
				onToggleMode={() => togglePanelMode(sessionId)}
				onClose={() => closePanel(sessionId)}
			/>
		</Box>
	);
}
