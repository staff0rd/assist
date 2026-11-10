import { Box } from "@mui/material";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";
import { type OptionPeek, optionRowProps } from "./optionRowProps";
import { QuestionOptionRow } from "./QuestionOptionRow";
import { QuestionOtherRow } from "./QuestionOtherRow";

export function QuestionOptions({
	name,
	question,
	choice,
	onPick,
	onPeek,
	peekedLabel,
	onPickOther,
	onOtherText,
	onSubmit,
}: OptionPeek & {
	name: string;
	question: AskQuestion;
	choice: QuestionChoice;
	onPickOther: () => void;
	onOtherText: (text: string) => void;
	onSubmit: () => void;
}) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{question.options.map((option) => (
				<QuestionOptionRow
					key={option.label}
					{...optionRowProps(name, question, choice, option, {
						onPick,
						onPeek,
						peekedLabel,
					})}
				/>
			))}
			<QuestionOtherRow
				name={name}
				question={question}
				choice={choice}
				onPickOther={onPickOther}
				onOtherText={onOtherText}
				onSubmit={onSubmit}
			/>
		</Box>
	);
}
