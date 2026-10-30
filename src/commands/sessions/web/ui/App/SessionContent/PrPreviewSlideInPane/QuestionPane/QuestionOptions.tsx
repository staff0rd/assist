import { Box } from "@mui/material";
import type { AskQuestion } from "../../../../../../shared/askQuestionInputSchema";
import type { QuestionChoice } from "./QuestionChoice";
import { QuestionOptionRow } from "./QuestionOptionRow";
import { QuestionOtherRow } from "./QuestionOtherRow";

export function QuestionOptions({
	name,
	question,
	choice,
	onPick,
	onPeek,
	onPickOther,
	onOtherText,
}: {
	name: string;
	question: AskQuestion;
	choice: QuestionChoice;
	onPick: (label: string) => void;
	onPeek: (label: string) => void;
	onPickOther: () => void;
	onOtherText: (text: string) => void;
}) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
			{question.options.map((option) => (
				<QuestionOptionRow
					key={option.label}
					name={name}
					multiSelect={question.multiSelect}
					checked={choice.labels.includes(option.label)}
					label={option.label}
					description={option.description}
					onChange={() => onPick(option.label)}
					onPeek={option.preview ? () => onPeek(option.label) : undefined}
				/>
			))}
			<QuestionOtherRow
				name={name}
				question={question}
				choice={choice}
				onPickOther={onPickOther}
				onOtherText={onOtherText}
			/>
		</Box>
	);
}
