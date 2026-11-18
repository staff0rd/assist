import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { cardTitleClassName } from "./cardTitleClassName";
import { CardHeaderActions } from "./CardHeader/CardHeaderActions";
import { sessionTitle } from "../../sessionTitle";
import type { CardHeaderProps } from "../../../types";
import { sessionTextSize } from "../../sessionTextSize";
import { sessionTypeSize } from "../../sessionTypeSize";
import { StatusRail } from "./CardHeader/StatusRail";

const busySx = {
	gridColumn: 2,
	gridRow: 2,
	color: "text.disabled",
	fontSize: sessionTypeSize("caption"),
} as const;

const headerRowSx = {
	gridColumn: "2 / -1",
	gridRow: 1,
	display: "flex",
	alignItems: "center",
	columnGap: 1,
	minWidth: 0,
} as const;

const titleSx = {
	flex: 1,
	color: "text.primary",
	fontSize: sessionTextSize("0.845rem"),
	lineHeight: "20px",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function CardHeader({
	session,
	loading,
	onRetry,
	onRestart,
	onStartOver,
	onDismiss,
	childDismiss,
}: CardHeaderProps) {
	return (
		<>
			<StatusRail session={session} loading={loading} />
			<Box sx={headerRowSx}>
				<Typography variant="body2" className={cardTitleClassName} sx={titleSx}>
					{sessionTitle(session)}
				</Typography>
				<CardHeaderActions
					session={session}
					loading={loading}
					onRetry={onRetry}
					onRestart={onRestart}
					onStartOver={onStartOver}
					onDismiss={onDismiss}
					childDismiss={childDismiss}
				/>
			</Box>
			{loading && (
				<Typography variant="caption" sx={busySx}>
					{session.closing ? "Closing…" : "Starting…"}
				</Typography>
			)}
		</>
	);
}
