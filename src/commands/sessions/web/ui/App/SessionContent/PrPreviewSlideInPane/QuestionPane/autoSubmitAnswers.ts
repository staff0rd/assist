import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";

export function autoSubmitAnswers(
	questions: AskQuestion[],
	choices: QuestionChoice[],
	index: number,
	label: string,
): Record<string, string> | undefined {
	if (questions.some((question) => question.multiSelect)) return undefined;
	const answers: Record<string, string> = {};
	for (const [i, question] of questions.entries()) {
		const picked = i === index ? label : choices[i]?.labels[0];
		if (!picked) return undefined;
		answers[question.question] = picked;
	}
	return answers;
}
