import { CHECK_RESULT_KEY } from "../shared/askCheckInputSchema";

function hasLaterPhases(body: string): boolean {
	try {
		const { laterPhases } = JSON.parse(body) as { laterPhases?: unknown };
		return Array.isArray(laterPhases) && laterPhases.length > 0;
	} catch {
		return false;
	}
}

export function midPlanCheckAnswers(
	body: string,
): Record<string, string> | undefined {
	return hasLaterPhases(body) ? { [CHECK_RESULT_KEY]: "works" } : undefined;
}
