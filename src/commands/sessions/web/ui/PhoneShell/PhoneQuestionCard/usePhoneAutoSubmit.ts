import type { AskQuestion } from "../../../../shared/askQuestionInputSchema";
import type { useQuestionAnswers } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useQuestionAnswers";
import { useAskQuestionAutoSubmit } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useAskQuestionAutoSubmit";

type QuestionState = ReturnType<typeof useQuestionAnswers>;

function completedAnswers(
	questions: AskQuestion[],
	answers: Record<string, string>,
	index: number,
	label: string,
): Record<string, string> | undefined {
	const completed: Record<string, string> = {};
	for (const [i, question] of questions.entries()) {
		const answer = i === index ? label : answers[question.question];
		if (!answer) return undefined;
		completed[question.question] = answer;
	}
	return completed;
}

export function usePhoneAutoSubmit({
	cwd,
	questions,
	state,
	onSubmit,
	onAdvance,
}: {
	cwd: string | undefined;
	questions: AskQuestion[];
	state: QuestionState;
	onSubmit: (answers: Record<string, string>) => void;
	onAdvance: (index: number) => void;
}) {
	const auto = useAskQuestionAutoSubmit(cwd);

	const afterPick = (index: number, label: string) => {
		if (questions[index]?.multiSelect) return;
		const completed = completedAnswers(questions, state.answers, index, label);
		auto.whenLoaded((enabled) => {
			if (!enabled) return;
			if (completed) onSubmit(completed);
			else onAdvance(index);
		});
	};

	return {
		toggle: { checked: auto.enabled, onChange: auto.setEnabled },
		pick: (index: number, label: string) => {
			state.pick(index, label);
			afterPick(index, label);
		},
		pickOther: (index: number) => {
			auto.cancel();
			state.pickOther(index);
		},
	};
}
