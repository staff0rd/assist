import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { CardHeader, cardSx } from "./CardHeader";
import { CardToggles } from "./CardToggles";
import { StatusRow } from "./StatusRow";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

export function SessionCard({
	session,
	active,
	loading,
	onClick,
	onRetry,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	active: boolean;
	loading: boolean;
	onClick: () => void;
	onRetry?: () => void;
	onDismiss: () => void;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const elapsed = useElapsed(session.startedAt, session.status);

	return (
		<ButtonBase onClick={onClick} sx={cardSx(active)}>
			<CardHeader session={session} onRetry={onRetry} onDismiss={onDismiss} />
			{loading ? (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
					<CircularProgress size={12} />
					<Typography variant="caption" color="text.disabled">
						Starting…
					</Typography>
				</Box>
			) : (
				<>
					<StatusRow
						status={session.status}
						elapsed={elapsed}
						restored={session.restored}
					/>
					<CardToggles
						session={session}
						onSetAutoRun={onSetAutoRun}
						onSetAutoAdvance={onSetAutoAdvance}
					/>
				</>
			)}
		</ButtonBase>
	);
}
