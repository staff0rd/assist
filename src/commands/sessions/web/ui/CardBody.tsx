import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { CardToggles } from "./CardToggles";
import { SessionErrorText } from "./SessionErrorText";
import { StatusRow } from "./StatusRow";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

export function CardBody({
	session,
	loading,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	loading: boolean;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);

	if (loading)
		return (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
				<CircularProgress size={12} />
				<Typography variant="caption" color="text.disabled">
					Starting…
				</Typography>
			</Box>
		);

	return (
		<>
			<StatusRow
				status={session.status}
				elapsed={elapsed}
				restored={session.restored}
			/>
			{session.status === "error" && <SessionErrorText error={session.error} />}
			<CardToggles
				session={session}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
		</>
	);
}
