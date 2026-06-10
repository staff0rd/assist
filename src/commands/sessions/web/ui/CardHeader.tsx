import type { SxProps, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardChips } from "./CardChips";
import { DismissButton } from "./DismissButton";
import { RetryButton } from "./RetryButton";
import { sessionTitle } from "./sessionTitle";
import type { SessionInfo } from "./types";

export function cardSx(active: boolean): SxProps<Theme> {
	return {
		display: "block",
		width: "100%",
		textAlign: "left",
		p: "10px 12px",
		mb: 0.5,
		borderRadius: 1.5,
		bgcolor: active ? "action.selected" : "background.default",
		border: 1,
		borderColor: active ? "primary.main" : "transparent",
		cursor: active ? "default" : "pointer",
		transition: "background 0.15s",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	};
}

export function CardHeader({
	session,
	onRetry,
	onDismiss,
}: {
	session: SessionInfo;
	onRetry?: () => void;
	onDismiss: () => void;
}) {
	const { status } = session;
	const isDone = status === "done";
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<CardChips session={session} />
				<Box sx={{ flex: 1 }} />
				{isDone && onRetry && <RetryButton onRetry={onRetry} />}
				<DismissButton status={status} onDismiss={onDismiss} />
			</Box>
			<Typography
				variant="body2"
				sx={{ color: "text.primary", overflowWrap: "anywhere" }}
			>
				{sessionTitle(session)}
			</Typography>
		</Box>
	);
}
