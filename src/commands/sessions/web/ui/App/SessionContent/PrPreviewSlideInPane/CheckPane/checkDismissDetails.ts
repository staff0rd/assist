import { CHECK_NOTE_KEY } from "../../../../../../shared/askCheckInputSchema";
import { miroDecisionDetails } from "../../miroDecisionDetails";

export function checkDismissDetails(note: string) {
	const trimmed = note.trim();
	return {
		...miroDecisionDetails(),
		...(trimmed ? { answers: { [CHECK_NOTE_KEY]: trimmed } } : {}),
	};
}
