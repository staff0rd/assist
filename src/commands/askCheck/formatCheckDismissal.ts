import { CHECK_NOTE_KEY } from "../sessions/shared/askCheckInputSchema";

export function formatCheckDismissal(answers?: Record<string, string>): string {
	const line =
		"The user dismissed the manual check without a result. Do not assume it passed; ask in chat if the result is essential.";
	const note = answers?.[CHECK_NOTE_KEY]?.trim();
	return note ? `${line}\nNote: ${note}` : line;
}
