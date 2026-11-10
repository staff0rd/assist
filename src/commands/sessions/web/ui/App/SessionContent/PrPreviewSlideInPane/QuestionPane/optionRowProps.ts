import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";

export type OptionPeek = {
	onPick: (label: string) => void;
	onPeek: (label: string) => void;
	peekedLabel: string | undefined;
};

export function optionRowProps(
	name: string,
	question: AskQuestion,
	choice: QuestionChoice,
	option: AskQuestion["options"][number],
	{ onPick, onPeek, peekedLabel }: OptionPeek,
) {
	return {
		name,
		multiSelect: question.multiSelect,
		checked: choice.labels.includes(option.label),
		label: option.label,
		description: option.description,
		onChange: () => onPick(option.label),
		onPeek: option.preview ? () => onPeek(option.label) : undefined,
		previewShown: option.label === peekedLabel,
	};
}
