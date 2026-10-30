import { Box, Divider } from "@mui/material";
import { useMemo } from "react";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import type { PrDecisionDetails } from "../../../PrDecisionDetails";
import { miroDecisionDetails } from "../miroDecisionDetails";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { parseQuestionPreview } from "./QuestionPane/parseQuestionPreview";
import { QuestionActions } from "./QuestionPane/QuestionActions";
import { QuestionList } from "./QuestionPane/QuestionList";
import { useQuestionAnswers } from "./QuestionPane/useQuestionAnswers";

export function QuestionPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	const questions = useMemo(
		() => parseQuestionPreview(preview.body),
		[preview.body],
	);
	const state = useQuestionAnswers(questions);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<QuestionList questions={questions} state={state} />
			<Divider />
			<QuestionActions
				answered={state.answered}
				total={questions.length}
				onAnswer={() =>
					onDecision("approve", {
						...miroDecisionDetails(),
						answers: state.answers,
					})
				}
				onDismiss={() => onDecision("reject", miroDecisionDetails())}
			/>
		</Box>
	);
}
