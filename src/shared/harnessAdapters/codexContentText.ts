import { rolloutString } from "../../commands/sessions/shared/codex/parseRolloutEntry";

export function codexContentText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((block) =>
			block && typeof block === "object"
				? rolloutString((block as Record<string, unknown>).text)
				: "",
		)
		.filter(Boolean)
		.join("\n");
}
