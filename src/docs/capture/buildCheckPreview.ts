import type { AskCheckInput } from "../../commands/sessions/shared/askCheckInputSchema";

export function buildCheckPreview(check: AskCheckInput) {
	return {
		kind: "check" as const,
		title: check.title,
		body: JSON.stringify({ ...check, laterPhases: [] }),
		prNumber: null,
	};
}
