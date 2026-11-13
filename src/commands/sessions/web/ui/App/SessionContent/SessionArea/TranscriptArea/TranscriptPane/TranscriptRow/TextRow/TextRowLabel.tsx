import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function TextRowLabel({
	isUser,
	accent,
	queued,
}: {
	isUser: boolean;
	accent: string;
	queued?: boolean;
}) {
	return (
		<Typography
			variant="caption"
			sx={{ color: accent, fontWeight: 600, display: "block", mb: 0.5 }}
		>
			{isUser ? "User" : "Assistant"}
			{queued && (
				<Box
					component="span"
					sx={{ fontWeight: 500, color: "text.secondary", ml: 0.75 }}
				>
					queued
				</Box>
			)}
		</Typography>
	);
}
