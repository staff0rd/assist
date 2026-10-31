import { useState } from "react";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../../App/SessionContent/miroDecisionDetails";
import {
	type QuestionDecision,
	useQuestionPreview,
} from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionPreview";

export function usePhoneQuestion(
	preview: PrPreview,
	onDecision: QuestionDecision,
) {
	const { questions, state } = useQuestionPreview(preview);
	const [page, setPage] = useState(0);
	const [sending, setSending] = useState(false);
	const question = questions[page];

	const decide: QuestionDecision = (decision, details) => {
		setSending(true);
		onDecision(decision, details);
	};

	return {
		questions,
		state,
		page,
		setPage,
		question,
		actions: {
			last: page === questions.length - 1,
			canAdvance: Boolean(question && state.answers[question.question]),
			canAnswer: state.answered === questions.length,
			sending,
			onNext: () => setPage(page + 1),
			onAnswer: () =>
				decide("approve", {
					...miroDecisionDetails(),
					answers: state.answers,
				}),
			onDismiss: () => decide("reject", miroDecisionDetails()),
		},
	};
}
