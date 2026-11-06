import type {
	AskCheckInput,
	LaterPhase,
} from "../../commands/sessions/shared/askCheckInputSchema";

export function buildCheckPreview(
	check: AskCheckInput & { laterPhases?: LaterPhase[] },
) {
	return {
		kind: "check" as const,
		title: check.title,
		body: JSON.stringify({ ...check, laterPhases: check.laterPhases ?? [] }),
		prNumber: null,
	};
}
