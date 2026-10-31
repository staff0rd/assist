import Box from "@mui/material/Box";
import type { QuestionFieldProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionFieldProps";
import { usePeekedOption } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/usePeekedOption";
import { PhoneQuestionOptions } from "./PhoneQuestionOptions";
import { PhoneQuestionPreview } from "./PhoneQuestionPreview";

export function PhoneQuestionFields({
	index,
	question,
	choice,
	onPick,
	onPickOther,
	onOtherText,
}: QuestionFieldProps) {
	const { peeked, setPeek } = usePeekedOption(question, choice.labels);

	return (
		<Box
			role="group"
			aria-label={question.question}
			sx={{ display: "flex", flexDirection: "column", gap: 1 }}
		>
			<Box sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3, mb: 0.5 }}>
				{question.question}
			</Box>
			<PhoneQuestionOptions
				name={`phone-question-${index}`}
				question={question}
				choice={choice}
				onPick={(label) => {
					onPick(label);
					setPeek(label);
				}}
				onPickOther={onPickOther}
				onOtherText={onOtherText}
			/>
			{peeked?.preview && (
				<PhoneQuestionPreview label={peeked.label} preview={peeked.preview} />
			)}
		</Box>
	);
}
