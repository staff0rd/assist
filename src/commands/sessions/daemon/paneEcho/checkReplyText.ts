import {
	CHECK_NOTE_KEY,
	CHECK_RESULT_KEY,
} from "../../shared/askCheckInputSchema";

const verdicts: Record<string, string> = {
	works: "Works",
	"doesn't work": "Doesn't work",
	later: "Later",
};

export function checkReplyText(answers: Record<string, string>): string {
	const verdict = verdicts[answers[CHECK_RESULT_KEY] ?? ""] ?? "";
	const note = (answers[CHECK_NOTE_KEY] ?? "").trim();
	return [verdict, note].filter(Boolean).join("\n\n");
}
