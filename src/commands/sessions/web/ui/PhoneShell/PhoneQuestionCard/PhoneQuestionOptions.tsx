import type { QuestionOtherProps } from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/QuestionFieldProps";
import {
	type OptionPeek,
	optionRowProps,
} from "../../App/SessionContent/PrPreviewSlideInPane/QuestionPane/optionRowProps";
import { PhoneQuestionOption } from "./PhoneQuestionOption";
import { PhoneQuestionOther } from "./PhoneQuestionOther";

export function PhoneQuestionOptions({
	onPick,
	onPeek,
	peekedLabel,
	...other
}: QuestionOtherProps & OptionPeek) {
	const { name, question, choice } = other;
	return (
		<>
			{question.options.map((option) => (
				<PhoneQuestionOption
					key={option.label}
					{...optionRowProps(name, question, choice, option, {
						onPick,
						onPeek,
						peekedLabel,
					})}
				/>
			))}
			<PhoneQuestionOther {...other} />
		</>
	);
}
