import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { areChipsLoading } from "./areChipsLoading";
import { CardActionButtons } from "./CardActionButtons";
import { CardChips } from "./CardChips";
import type { CardHeaderProps } from "./types";

export function CardHeaderActions({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
			{areChipsLoading(session, loading) ? (
				<CircularProgress size={12} />
			) : (
				<CardChips session={session} />
			)}
			<Box sx={{ flex: 1 }} />
			<CardActionButtons
				session={session}
				loading={loading}
				onRetry={onRetry}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
		</Box>
	);
}
