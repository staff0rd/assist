import { CHECK_RESULT_KEY } from "../shared/askCheckInputSchema";
import type { Session } from "./createSession";

function hasLaterPhases(body: string): boolean {
	try {
		const { laterPhases } = JSON.parse(body) as { laterPhases?: unknown };
		return Array.isArray(laterPhases) && laterPhases.length > 0;
	} catch {
		return false;
	}
}

export function yoloCheckAnswers(
	body: string,
	session: Session,
): Record<string, string> | undefined {
	return session.reviewStarted || hasLaterPhases(body)
		? { [CHECK_RESULT_KEY]: "works" }
		: undefined;
}
