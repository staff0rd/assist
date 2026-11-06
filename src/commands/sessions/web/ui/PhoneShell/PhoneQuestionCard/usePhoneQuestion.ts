import { useState } from "react";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import { miroDecisionDetails } from "../../App/SessionContent/miroDecisionDetails";
import {
	type QuestionDecision,
	useQuestionPreview,
} from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionPreview";
import { usePhoneAutoSubmit } from "./usePhoneAutoSubmit";

export function usePhoneQuestion(
	preview: PrPreview,
	cwd: string | undefined,
	onDecision: QuestionDecision,
) {
	const { questions, state } = useQuestionPreview(preview);
	const [page, setPage] = useState(0);
	const [sending, setSending] = useState(false);
	const question = questions[page];
	const last = page === questions.length - 1;

	const decide: QuestionDecision = (decision, details) => {
		setSending(true);
		onDecision(decision, details);
	};
	const answer = (answers: Record<string, string>) =>
		decide("approve", { ...miroDecisionDetails(), answers });

	const auto = usePhoneAutoSubmit({
		cwd,
		questions,
		choices: state.choices,
		onSubmit: answer,
		onAdvance: (index) => {
			if (index === page && !last) setPage(page + 1);
		},
	});

	return {
		questions,
		state,
		pick: (index: number, label: string) => {
			state.pick(index, label);
			auto.afterPick(index, label);
		},
		page,
		setPage,
		question,
		autoSubmit: auto.toggle,
		actions: {
			last,
			canAdvance: Boolean(question && state.answers[question.question]),
			canAnswer: state.answered === questions.length,
			sending,
			onNext: () => setPage(page + 1),
			onAnswer: () => answer(state.answers),
			onDismiss: () => decide("reject", miroDecisionDetails()),
		},
	};
}
