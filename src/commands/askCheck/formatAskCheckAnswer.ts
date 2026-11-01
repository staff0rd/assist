import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../sessions/shared/askCheckInputSchema";

export function formatAskCheckAnswer(
	title: string,
	answers: Record<string, string>,
): string {
	const result = answers[CHECK_RESULT_KEY] ?? "";
	const note = answers[CHECK_NOTE_KEY]?.trim();
	const line = `Manual check "${title}": ${result}`;
	return note ? `${line}\nNote: ${note}` : line;
}
