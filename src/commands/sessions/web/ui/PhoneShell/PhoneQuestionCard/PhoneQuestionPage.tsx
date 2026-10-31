import type { usePhoneQuestion } from "./usePhoneQuestion";
import { PhoneQuestionFields } from "./PhoneQuestionFields";
import { PhoneQuestionHead } from "./PhoneQuestionHead";

export function PhoneQuestionPage({
	model: { questions, state, page, setPage, question },
}: {
	model: ReturnType<typeof usePhoneQuestion>;
}) {
	if (!question) return null;
	return (
		<>
			<PhoneQuestionHead
				header={question.header}
				multiSelect={question.multiSelect}
				page={page}
				total={questions.length}
				onBack={page > 0 ? () => setPage(page - 1) : undefined}
			/>
			<PhoneQuestionFields
				key={page}
				index={page}
				question={question}
				choice={state.choices[page]}
				onPick={(label) => state.pick(page, label)}
				onPickOther={() => state.pickOther(page)}
				onOtherText={(text) => state.setOtherText(page, text)}
			/>
		</>
	);
}
