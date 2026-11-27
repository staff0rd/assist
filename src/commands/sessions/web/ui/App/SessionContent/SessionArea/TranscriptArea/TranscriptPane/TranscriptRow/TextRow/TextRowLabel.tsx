import Box from "@mui/material/Box";
import { sessionTypeSize } from "../../../../../../sessionTypeSize";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import type { SessionMessage } from "../../../../../../../../../shared/parseSessionMessage";
import { SessionMessageLabel } from "./SessionMessageLabel";

export function TextRowLabel({
	isUser,
	accent,
	sender,
	queued,
	actions,
}: {
	isUser: boolean;
	accent: string;
	sender?: SessionMessage | null;
	queued?: boolean;
	actions?: ReactNode;
}) {
	return (
		<Typography
			variant="caption"
			component="div"
			sx={{
				color: accent,
				fontSize: sessionTypeSize("caption"),
				fontWeight: 600,
				display: "flex",
				alignItems: "center",
				mb: 0.5,
			}}
		>
			<Box component="span" sx={{ opacity: queued ? 0.65 : 1 }}>
				{sender ? (
					<SessionMessageLabel sender={sender} />
				) : isUser ? (
					"User"
				) : (
					"Assistant"
				)}
				{queued && (
					<Box
						component="span"
						sx={{ fontWeight: 500, color: "text.secondary", ml: 0.75 }}
					>
						queued
					</Box>
				)}
			</Box>
			{actions}
		</Typography>
	);
}
