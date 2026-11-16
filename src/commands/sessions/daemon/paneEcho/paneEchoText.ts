import type { PrPreview } from "../../shared/SessionInfoBase";
import { checkReplyText } from "./checkReplyText";
import { questionAnswerText } from "./questionAnswerText";
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
	if (d.dismissed === true) return "Dismissed";
	switch (preview.kind) {
		case "check":
			return checkReplyText(answersOf(d));
		case "question":
			return questionAnswerText(preview.body, answersOf(d));
		case "ask":
		case "backlog-item":
		case "rule":
		case "design":
			return signOffText(d);
		default:
			return "";
	}
}
