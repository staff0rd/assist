import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../miroDecisionDetails";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { autoSubmitAnswers } from "./QuestionPane/autoSubmitAnswers";
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
	const submit = (answers: Record<string, string>) =>
		onDecision("approve", { ...miroDecisionDetails(), answers });
	const pick = (index: number, label: string) => {
		state.pick(index, label);
		const answers =
			autoApprove && autoSubmitAnswers(questions, state.choices, index, label);
		if (answers) submit(answers);
	};

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<QuestionList questions={questions} state={{ ...state, pick }} />
			<Divider />
			<QuestionActions
				answered={state.answered}
				total={questions.length}
				autoApprove={autoApprove}
				onAutoApproveChange={setAutoApprove}
				onAnswer={() => submit(state.answers)}
				onDismiss={() => onDecision("reject", miroDecisionDetails())}
			/>
		</Box>
	);
}
