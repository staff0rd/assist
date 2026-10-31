import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";

export type QuestionOtherProps = {
	name: string;
	question: AskQuestion;
	choice: QuestionChoice;
	onPickOther: () => void;
	onOtherText: (text: string) => void;
};

export type QuestionFieldProps = Omit<QuestionOtherProps, "name"> & {
	index: number;
	onPick: (label: string) => void;
};
