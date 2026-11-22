import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../sessions/shared/askCheckInputSchema";
import type { AutoAnsweredBy } from "../sessions/shared/autoAnsweredBy";

const BY_LABEL: Record<AutoAnsweredBy, string> = {
	yolo: "yolo mode",
	autopilot: "autopilot",
};

export function formatAskCheckAnswer(
	title: string,
	answers: Record<string, string>,
	answeredBy?: AutoAnsweredBy,
): string {
	if (answeredBy)
		return `Manual check "${title}": works (marked Works by ${BY_LABEL[answeredBy]}; the user did not see it)`;
	const result = answers[CHECK_RESULT_KEY] ?? "";
	const note = answers[CHECK_NOTE_KEY]?.trim();
	const line = `Manual check "${title}": ${result}`;
	return note ? `${line}\nNote: ${note}` : line;
}
