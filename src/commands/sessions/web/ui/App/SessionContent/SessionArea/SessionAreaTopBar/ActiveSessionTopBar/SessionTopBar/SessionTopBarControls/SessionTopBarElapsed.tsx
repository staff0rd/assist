import Typography from "@mui/material/Typography";
import type { SessionInfo } from "../../../../../../../types";
import { useElapsed } from "../../../../../../useElapsed";

export function SessionTopBarElapsed({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);

	return (
		<Typography
			variant="caption"
			sx={{ flexShrink: 0, whiteSpace: "nowrap", color: "text.disabled" }}
		>
			{elapsed}
		</Typography>
	);
}
