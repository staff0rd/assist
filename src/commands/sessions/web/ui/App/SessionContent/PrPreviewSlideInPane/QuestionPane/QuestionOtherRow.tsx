import { TextField } from "@mui/material";
import type { KeyboardEvent } from "react";
import type { QuestionOtherProps } from "./QuestionFieldProps";
import { QuestionOptionRow } from "./QuestionOptionRow";

export function QuestionOtherRow({
	name,
	question,
	choice,
	onPickOther,
	onOtherText,
	onSubmit,
}: QuestionOtherProps & { onSubmit: () => void }) {
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Enter" || event.shiftKey) return;
		if (event.nativeEvent.isComposing) return;
		event.preventDefault();
		onSubmit();
	};

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
					multiline
					autoFocus
					placeholder="Type your answer"
					value={choice.otherText}
					onChange={(event) => onOtherText(event.target.value)}
					onKeyDown={onKeyDown}
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
