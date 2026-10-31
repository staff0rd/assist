import InputBase from "@mui/material/InputBase";
import type { QuestionOtherProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionFieldProps";
import { PhoneQuestionOption } from "./PhoneQuestionOption";

const fieldSx = {
	mt: 1,
	width: "100%",
	px: 1.5,
	py: 1,
	borderRadius: "10px",
	border: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	fontSize: 16,
	"&.Mui-focused": { borderColor: "primary.main" },
} as const;

export function PhoneQuestionOther({
	name,
	question,
	choice,
	onPickOther,
	onOtherText,
}: QuestionOtherProps) {
	return (
		<PhoneQuestionOption
			name={name}
			multiSelect={question.multiSelect}
			checked={choice.otherOn}
			label="Other…"
			description={choice.otherOn ? undefined : "Type your own answer"}
			onChange={onPickOther}
		>
			{choice.otherOn && (
				<InputBase
					multiline
					maxRows={4}
					autoFocus
					placeholder="Type your answer"
					value={choice.otherText}
					onChange={(event) => onOtherText(event.target.value)}
					inputProps={{ "aria-label": `Other answer for ${question.header}` }}
					sx={fieldSx}
				/>
			)}
		</PhoneQuestionOption>
	);
}
