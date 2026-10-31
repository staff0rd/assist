import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";

export function optionRowProps(
	name: string,
	question: AskQuestion,
	choice: QuestionChoice,
	option: AskQuestion["options"][number],
) {
	return {
		name,
		multiSelect: question.multiSelect,
		checked: choice.labels.includes(option.label),
		label: option.label,
		description: option.description,
	};
}
