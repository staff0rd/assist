import Box from "@mui/material/Box";
import { CardActionButtons } from "./CardHeaderActions/CardActionButtons";
import type { CardHeaderProps } from "../../../../types";

const actionsSx = {
	flexShrink: 0,
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 0.25,
} as const;

export function CardHeaderActions({
	session,
	loading,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	return (
		<Box sx={actionsSx}>
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
