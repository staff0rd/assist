import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";

export function parseWsFrame(data: unknown): Record<string, unknown> | null {
	try {
		const parsed = JSON.parse(String(data));
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch (error) {
		reportCaughtError(
			error,
			`dropped malformed /ws frame (${String(data).length} chars)`,
		);
		return null;
	}
}
