import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../miroDecisionDetails";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { QuestionActions } from "./QuestionPane/QuestionActions";
import { QuestionList } from "./QuestionPane/QuestionList";
import {
	type QuestionDecision,
	useQuestionPreview,
} from "./QuestionPane/useQuestionPreview";

export function QuestionPane({
	preview,
	onDecision,
}: {
	preview: PrPreview;
	onDecision: QuestionDecision;
}) {
	const { questions, state } = useQuestionPreview(preview);

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
