import { Typography } from "@mui/material";
import { InlineMarkdown } from "../InlineMarkdown";

export function QuestionContext({ context }: { context?: string }) {
	if (!context) return null;
	return (
		<Typography
			variant="body2"
			component="span"
			sx={{ color: "text.secondary", mt: 0.5, mb: 0.5 }}
		>
			<InlineMarkdown text={context} />
		</Typography>
	);
}
