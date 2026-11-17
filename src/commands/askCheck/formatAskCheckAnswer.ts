import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../sessions/shared/askCheckInputSchema";

export function formatAskCheckAnswer(
	title: string,
	answers: Record<string, string>,
	yolo = false,
): string {
	if (yolo)
		return `Manual check "${title}": works (marked Works by yolo mode; the user did not see it)`;
	const result = answers[CHECK_RESULT_KEY] ?? "";
	const note = answers[CHECK_NOTE_KEY]?.trim();
	const line = `Manual check "${title}": ${result}`;
	return note ? `${line}\nNote: ${note}` : line;
}
