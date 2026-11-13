import { Typography } from "@mui/material";

export function QuestionContext({ context }: { context?: string }) {
	if (!context) return null;
	return (
		<Typography
			variant="body2"
			component="span"
			sx={{ color: "text.secondary", mt: 0.5, mb: 0.5 }}
		>
			{context}
		</Typography>
	);
}
