import { CHECK_NOTE_KEY } from "../../shared/askCheckInputSchema";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { questionOtherText } from "./questionOtherText";
import { signOffText } from "./signOffText";

function answersOf(d: Record<string, unknown>): Record<string, string> {
	const answers = d.answers;
	if (!answers || typeof answers !== "object") return {};
	return Object.fromEntries(
		Object.entries(answers).filter(
			(entry): entry is [string, string] => typeof entry[1] === "string",
		),
	);
}

export function paneEchoText(
	preview: PrPreview,
	d: Record<string, unknown>,
): string {
	if (d.dismissed === true) return "";
	switch (preview.kind) {
		case "check":
			return (answersOf(d)[CHECK_NOTE_KEY] ?? "").trim();
		case "question":
			return questionOtherText(preview.body, answersOf(d));
		case "ask":
		case "backlog-item":
			return signOffText(d);
		default:
			return "";
	}
}
