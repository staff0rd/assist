import { noSavedSlicesPrefix } from "../../../../../../../../../../shared/noSavedSlicesMessage";
import { apiFetch } from "../../../../../../apiFetch";
import { reportCaughtError } from "../../../../../../clientFailures/reportCaughtError";
import { withNode } from "../../../../../../withNode";

const REOPEN_TIMEOUT_MS = 180_000;
const FAILED = "Failed to reopen the high-level review";

function describeFailure(error: string | undefined): string {
	if (!error) return FAILED;
	return error.startsWith(noSavedSlicesPrefix)
		? `${error}. Tick Force re-run to slice it again.`
		: error;
}

export async function requestReopenHighLevelReview(
	sessionId: string,
	prNumber: number,
	node: string | undefined,
): Promise<string | null> {
	try {
		const res = await apiFetch(
			withNode("/api/sessions/reopen-high-level-review", node),
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sessionId, prNumber }),
				timeoutMs: REOPEN_TIMEOUT_MS,
			},
		);
		if (res.ok) return null;
		const body = await res.json().catch(() => null);
		return describeFailure(body?.error);
	} catch (error) {
		reportCaughtError(error, "reopen high-level review");
		return FAILED;
	}
}
