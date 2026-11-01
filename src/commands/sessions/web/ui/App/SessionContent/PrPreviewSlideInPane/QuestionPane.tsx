import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../miroDecisionDetails";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { QuestionActions } from "./QuestionPane/QuestionActions";
import { QuestionList } from "./QuestionPane/QuestionList";
import { useAskQuestionAutoApprove } from "./QuestionPane/useAskQuestionAutoApprove";
import {
	type QuestionDecision,
	useQuestionPreview,
} from "./QuestionPane/useQuestionPreview";

export function QuestionPane({
	preview,
	cwd,
	onDecision,
}: {
	preview: PrPreview;
	cwd?: string | undefined;
	onDecision: QuestionDecision;
}) {
	const { questions, state } = useQuestionPreview(preview);
	const [autoApprove, setAutoApprove] = useAskQuestionAutoApprove(cwd);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<QuestionList questions={questions} state={state} />
			<Divider />
			<QuestionActions
				answered={state.answered}
				total={questions.length}
				autoApprove={autoApprove}
				onAutoApproveChange={setAutoApprove}
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
