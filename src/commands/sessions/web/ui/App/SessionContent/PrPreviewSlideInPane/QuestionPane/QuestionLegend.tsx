import { Box, Typography } from "@mui/material";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import { QuestionContext } from "./QuestionContext";

export function QuestionLegend({ question }: { question: AskQuestion }) {
	return (
		<Box
			component="legend"
			sx={{ p: 0, mb: 1.5, display: "flex", flexDirection: "column" }}
		>
			<Typography
				variant="caption"
				sx={{
					fontFamily: "fontFamilyMono",
					textTransform: "uppercase",
					color: "text.secondary",
				}}
			>
				{question.header} · {question.multiSelect ? "pick any" : "pick one"}
			</Typography>
			<QuestionContext context={question.context} />
			<Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
				{question.question}
			</Typography>
		</Box>
	);
}
