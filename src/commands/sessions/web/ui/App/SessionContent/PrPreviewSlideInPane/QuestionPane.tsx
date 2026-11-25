import { Box, Divider } from "@mui/material";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { PrPreviewHeader } from "../PrPreviewHeader";
import { prPreviewPaneSx } from "../prPreviewPaneSx";
import { QuestionActions } from "./QuestionPane/QuestionActions";
import { QuestionList } from "./QuestionPane/QuestionList";
import { UnsentAlert } from "./QuestionPane/UnsentAlert";
import { useQuestionPaneActions } from "./QuestionPane/useQuestionPaneActions";
import type { QuestionDecision } from "./QuestionPane/useQuestionPreview";

export function QuestionPane({
	preview,
	cwd,
	onDecision,
}: {
	preview: PrPreview;
	cwd?: string | undefined;
	onDecision: QuestionDecision;
}) {
	const pane = useQuestionPaneActions(preview, cwd, onDecision);

	return (
		<Box sx={prPreviewPaneSx}>
			<PrPreviewHeader preview={preview} draft={false} />
			<Divider />
			<QuestionList
				questions={pane.questions}
				state={pane.state}
				onSubmit={pane.submitIfAnswered}
			/>
			<Divider />
			{pane.unsent && <UnsentAlert />}
			<QuestionActions
				answered={pane.state.answered}
				total={pane.questions.length}
				autoSubmit={pane.auto.enabled}
				onAutoSubmitChange={pane.auto.setEnabled}
				onAnswer={pane.answer}
				onDismiss={pane.dismiss}
			/>
		</Box>
	);
}
