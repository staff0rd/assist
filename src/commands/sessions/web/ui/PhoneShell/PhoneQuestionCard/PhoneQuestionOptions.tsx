import type { QuestionOtherProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionFieldProps";
import { optionRowProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/optionRowProps";
import { PhoneQuestionOption } from "./PhoneQuestionOption";
import { PhoneQuestionOther } from "./PhoneQuestionOther";

export function PhoneQuestionOptions({
	onPick,
	...other
}: QuestionOtherProps & { onPick: (label: string) => void }) {
	const { name, question, choice } = other;
	return (
		<>
			{question.options.map((option) => (
				<PhoneQuestionOption
					key={option.label}
					{...optionRowProps(name, question, choice, option)}
					onChange={() => onPick(option.label)}
				/>
			))}
			<PhoneQuestionOther {...other} />
		</>
	);
}
