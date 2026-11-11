import type { QuestionDecision } from "../QuestionPane/useQuestionPreview";
import type { CheckActionsProps } from "./CheckActionsProps";
import { checkAnswerDetails } from "./checkAnswerDetails";
import { checkDismissDetails } from "./checkDismissDetails";

export function checkDecisionHandlers(
	onDecision: QuestionDecision,
): Pick<CheckActionsProps, "onResult" | "onDismiss"> {
	return {
		onResult: (result, note, phase) =>
			onDecision("approve", checkAnswerDetails(result, note, phase)),
		onDismiss: (note) => onDecision("reject", checkDismissDetails(note)),
	};
}
