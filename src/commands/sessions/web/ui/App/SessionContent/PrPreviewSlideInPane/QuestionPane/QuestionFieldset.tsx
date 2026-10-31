import { Box } from "@mui/material";
import type { QuestionFieldProps } from "./QuestionFieldProps";
import { QuestionLegend } from "./QuestionLegend";
import { QuestionOptionPreview } from "./QuestionOptionPreview";
import { QuestionOptions } from "./QuestionOptions";
import { usePeekedOption } from "./usePeekedOption";

export function QuestionFieldset({
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
			component="fieldset"
			sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
			onMouseLeave={() => setPeek(null)}
		>
			<QuestionLegend question={question} />
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: peeked
						? "minmax(0, 1fr) minmax(0, 1.1fr)"
						: "minmax(0, 1fr)",
					gap: 2,
					alignItems: "start",
				}}
			>
				<QuestionOptions
					name={`question-${index}`}
					question={question}
					choice={choice}
					onPick={onPick}
					onPeek={setPeek}
					onPickOther={onPickOther}
					onOtherText={onOtherText}
				/>
				{peeked?.preview && (
					<QuestionOptionPreview
						label={peeked.label}
						preview={peeked.preview}
					/>
				)}
			</Box>
		</Box>
	);
}
