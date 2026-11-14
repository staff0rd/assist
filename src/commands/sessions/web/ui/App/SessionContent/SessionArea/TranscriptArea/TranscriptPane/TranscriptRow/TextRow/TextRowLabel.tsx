import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function TextRowLabel({
	isUser,
	accent,
	queued,
	actions,
}: {
	isUser: boolean;
	accent: string;
	queued?: boolean;
	actions?: ReactNode;
}) {
	return (
		<Typography
			variant="caption"
			component="div"
			sx={{
				color: accent,
				fontWeight: 600,
				display: "flex",
				alignItems: "center",
				mb: 0.5,
			}}
		>
			<Box component="span" sx={{ opacity: queued ? 0.65 : 1 }}>
				{isUser ? "User" : "Assistant"}
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
