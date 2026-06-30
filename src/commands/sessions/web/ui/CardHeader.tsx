import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardHeaderActions } from "./CardHeaderActions";
import { sessionTitle } from "./sessionTitle";
import type { SessionInfo } from "./types";

export function CardHeader({
	session,
	loading,
	onRetry,
	onDismiss,
}: {
	session: SessionInfo;
	loading: boolean;
	onRetry?: () => void;
	onDismiss: () => void;
}) {
	const { activity, status } = session;
	const phaseName =
		activity?.kind === "backlog" && status !== "done"
			? activity.phaseName
			: undefined;
	const caption = phaseName ?? session.subtitle;
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
			<CardHeaderActions
				session={session}
				loading={loading}
				onRetry={onRetry}
				onDismiss={onDismiss}
			/>
			<Typography
				variant="body2"
				sx={{
					color: "text.primary",
					overflowWrap: "anywhere",
					display: "-webkit-box",
					WebkitBoxOrient: "vertical",
					WebkitLineClamp: 5,
					overflow: "hidden",
				}}
			>
				{sessionTitle(session)}
			</Typography>
			{caption && (
				<Typography
					variant="caption"
					sx={{ color: "text.secondary", overflowWrap: "anywhere" }}
				>
					{caption}
				</Typography>
			)}
		</Box>
	);
}
