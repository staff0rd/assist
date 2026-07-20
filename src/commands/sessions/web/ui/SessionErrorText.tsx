import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function SessionErrorText({
	error,
	errorOutput,
}: {
	error?: string;
	errorOutput?: string;
}) {
	if (!error && !errorOutput) return null;
	return (
		<>
			{error && (
				<Typography
					variant="caption"
					color="error.main"
					sx={{ display: "block", mt: 0.5 }}
				>
					{error}
				</Typography>
			)}
			{errorOutput && (
				<Box
					component="pre"
					sx={{
						mt: 0.5,
						mb: 0,
						p: 1,
						maxHeight: 160,
						overflow: "auto",
						fontFamily: "monospace",
						fontSize: "0.7rem",
						lineHeight: 1.4,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
						bgcolor: "action.hover",
						borderRadius: 1,
						color: "text.secondary",
					}}
				>
					{errorOutput}
				</Box>
			)}
		</>
	);
}
