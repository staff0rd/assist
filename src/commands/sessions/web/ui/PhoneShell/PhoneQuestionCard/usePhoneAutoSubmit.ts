import type { AskQuestion } from "../../../../shared/askQuestionInputSchema";
import { useAskQuestionAutoSubmit } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/useAskQuestionAutoSubmit";

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
	answers,
	onSubmit,
	onAdvance,
}: {
	cwd: string | undefined;
	questions: AskQuestion[];
	answers: Record<string, string>;
	onSubmit: (answers: Record<string, string>) => void;
	onAdvance: (index: number) => void;
}) {
	const [checked, onChange] = useAskQuestionAutoSubmit(cwd);

	const afterPick = (index: number, label: string) => {
		if (!checked || questions[index]?.multiSelect) return;
		const completed = completedAnswers(questions, answers, index, label);
		if (completed) onSubmit(completed);
		else onAdvance(index);
	};

	return { toggle: { checked, onChange }, afterPick };
}
