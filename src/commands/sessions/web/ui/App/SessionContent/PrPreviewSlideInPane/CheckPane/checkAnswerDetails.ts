import {
	CHECK_NOTE_KEY,
	CHECK_PHASE_KEY,
	CHECK_RESULT_KEY,
	type CheckResult,
} from "../../../../../../shared/askCheckInputSchema";
import { miroDecisionDetails } from "../../miroDecisionDetails";

export function checkAnswerDetails(
	result: CheckResult,
	note: string,
	phase?: number,
) {
	const trimmed = note.trim();
	return {
		...miroDecisionDetails(),
		answers: {
			[CHECK_RESULT_KEY]: result,
			...(trimmed ? { [CHECK_NOTE_KEY]: trimmed } : {}),
			...(phase !== undefined ? { [CHECK_PHASE_KEY]: String(phase) } : {}),
		},
	};
}
