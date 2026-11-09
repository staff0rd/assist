import Box from "@mui/material/Box";
import { sessionConversationTarget } from "../../../../../../shared/sessionConversationTarget";
import { GitStatusCounts } from "../../../GitStatusCounts";
import { SessionMetaCaptions } from "./CardDataLine/SessionMetaCaptions";
import type { SessionInfo } from "../../../../types";

const dataSx = {
	gridColumn: 3,
	gridRow: 2,
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 0.75,
	minWidth: 0,
} as const;

export function CardDataLine({ session }: { session: SessionInfo }) {
	return (
		<Box sx={dataSx}>
			<SessionMetaCaptions
				usedPct={session.usedPct}
				harness={session.harness}
				undurable={session.undurable}
			/>
			{session.cwd && (
				<GitStatusCounts
					panelSessionId={session.id}
					cwd={session.cwd}
					conversation={sessionConversationTarget(session)}
				/>
			)}
		</Box>
	);
}
