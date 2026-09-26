import Box from "@mui/material/Box";
import type { SessionInfo, SessionListHandlers } from "../../../types";
import { ActiveSessionTopBar } from "./ActiveSessionTopBar";

const topBarSx = { flexShrink: 0 } as const;

export function SessionAreaTopBar({
	shown,
	session,
	lifecycle,
}: {
	shown: boolean;
	session: SessionInfo | undefined;
	lifecycle: SessionListHandlers;
}) {
	if (!shown || session === undefined) return null;
	return (
		<Box sx={topBarSx}>
			<ActiveSessionTopBar session={session} lifecycle={lifecycle} />
		</Box>
	);
}
