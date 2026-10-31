import Box from "@mui/material/Box";
import { sessionToggles } from "../../App/sessionToggles";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneSheetToggle } from "./PhoneSheetToggle";

const toggleLabels = {
	autoApprove: "Auto approve & start",
	autoAdvance: "Auto-advance phases",
};

export function PhoneToggleGroup({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	const toggles = sessionToggles(session);
	if (toggles.length === 0) return null;
	const set = {
		autoApprove: socket.setAutoApprove,
		autoAdvance: socket.setAutoAdvance,
	};
	return (
		<Box sx={nodeListSx.group}>
			{toggles.map((t) => (
				<PhoneSheetToggle
					key={t.key}
					label={toggleLabels[t.key]}
					checked={t.checked}
					onChange={(on) => set[t.key](session.id, on)}
				/>
			))}
		</Box>
	);
}
