import type { SxProps, Theme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DismissButton } from "./DismissButton";
import { RetryButton } from "./RetryButton";

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
		cursor: "pointer",
		transition: "background 0.15s",
		"&:hover": !active ? { bgcolor: "action.hover" } : undefined,
	};
}

export function CardHeader({
	name,
	isDone,
	onRetry,
	onDismiss,
}: {
	name: string;
	isDone: boolean;
	onRetry?: () => void;
	onDismiss: () => void;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			<Typography
				variant="body2"
				noWrap
				sx={{ flex: 1, color: "text.primary" }}
			>
				{name}
			</Typography>
			{isDone && onRetry && <RetryButton onRetry={onRetry} />}
			{isDone && <DismissButton onDismiss={onDismiss} />}
		</Box>
	);
}
