import { TextField } from "@mui/material";
import type { QuestionOtherProps } from "./QuestionFieldProps";
import { QuestionOptionRow } from "./QuestionOptionRow";

export function QuestionOtherRow({
	name,
	question,
	choice,
	onPickOther,
	onOtherText,
}: QuestionOtherProps) {
	return (
		<QuestionOptionRow
			name={name}
			multiSelect={question.multiSelect}
			checked={choice.otherOn}
			label="Other"
			onChange={onPickOther}
		>
			{choice.otherOn && (
				<TextField
					size="small"
					autoFocus
					placeholder="Type your answer"
					value={choice.otherText}
					onChange={(event) => onOtherText(event.target.value)}
					slotProps={{
						htmlInput: {
							"aria-label": `Other answer for ${question.header}`,
						},
					}}
					sx={{ mt: 1 }}
				/>
			)}
		</QuestionOptionRow>
	);
}
