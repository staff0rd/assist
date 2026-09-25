import Box from "@mui/material/Box";
import { SessionMetaCaptions } from "../SessionMetaCaptions";
import { SessionStatusDot } from "../../../../SessionStatusDot";
import type { SessionStatus } from "../../../../../types";

export function SessionStatusCaptions({
	status,
	restored,
	usedPct,
	undurable,
}: {
	status: SessionStatus;
	restored?: boolean;
	usedPct?: number;
	undurable?: { reason: string };
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<SessionStatusDot status={status} label />
			<SessionMetaCaptions
				restored={restored}
				usedPct={usedPct}
				undurable={undurable}
			/>
		</Box>
	);
}
