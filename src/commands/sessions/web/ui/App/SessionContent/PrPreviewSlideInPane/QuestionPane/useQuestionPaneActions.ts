import { useState } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../../miroDecisionDetails";
import { autoSubmitAnswers } from "./autoSubmitAnswers";
import { useAskQuestionAutoSubmit } from "./useAskQuestionAutoSubmit";
import {
	type QuestionDecision,
	useQuestionPreview,
} from "./useQuestionPreview";

export function useQuestionPaneActions(
	preview: PrPreview,
	cwd: string | undefined,
	onDecision: QuestionDecision,
) {
	const { questions, state } = useQuestionPreview(preview);
	const auto = useAskQuestionAutoSubmit(cwd);
	const [unsent, setUnsent] = useState(false);
	const decide: QuestionDecision = (decision, details) => {
		const sent = onDecision(decision, details) !== false;
		setUnsent(!sent);
		return sent;
	};
	const submit = (answers: Record<string, string>) =>
		decide("approve", { ...miroDecisionDetails(), answers });
	const pick = (index: number, label: string) => {
		state.pick(index, label);
		const answers = autoSubmitAnswers(questions, state.choices, index, label);
		if (!answers) return auto.cancel();
		auto.whenLoaded((enabled) => {
			if (enabled) submit(answers);
		});
	};
	const pickOther = (index: number) => {
		auto.cancel();
		state.pickOther(index);
	};

	return {
		questions,
		state: { ...state, pick, pickOther },
		auto,
		unsent,
		submitIfAnswered: () => {
			if (state.answered === questions.length) submit(state.answers);
		},
		answer: () => submit(state.answers),
		dismiss: () => decide("reject", miroDecisionDetails()),
	};
}
