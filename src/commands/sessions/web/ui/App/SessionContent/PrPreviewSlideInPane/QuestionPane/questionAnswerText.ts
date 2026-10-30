import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";

export function questionAnswerText(
	question: AskQuestion,
	choice: QuestionChoice,
): string {
	const labels = question.options
		.map((option) => option.label)
		.filter((label) => choice.labels.includes(label));
	const other = choice.otherOn ? choice.otherText.trim() : "";
	return [...labels, ...(other ? [other] : [])].join(", ");
}
