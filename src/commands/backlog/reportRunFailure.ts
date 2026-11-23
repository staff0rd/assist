import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import { loadPhaseProgress } from "./phaseRun/loadPhaseProgress";
import { getReady } from "./shared";
import type { BacklogItem } from "./types";

type FailedKind = "fail" | "abort" | "incomplete";

async function failedPhase(item: BacklogItem): Promise<string | undefined> {
	try {
		const { orm } = await getReady();
		const progress = await loadPhaseProgress(orm, item.id);
		const failed = progress.failed.map((idx) => idx + 1);
		if (failed.length > 0) return `phase ${failed.join(", ")}`;
		return progress.currentPhase ? `phase ${progress.currentPhase}` : undefined;
	} catch {
		return undefined;
	}
}

const reasons: Record<FailedKind, string> = {
	fail: "the phase did not complete, so the run stopped",
	abort: "the review was aborted",
	incomplete: "the review ended without completing the item",
};

/** Tell the daemon a run failed, so an autopilot schedule that started it pauses. */
export async function reportRunFailure(
	item: BacklogItem,
	kind: FailedKind,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;
	const phase = kind === "fail" ? await failedPhase(item) : "Review";
	await requestDaemonReply(
		{ type: "autopilot-failure", sessionId, reason: reasons[kind], phase },
		"autopilot-failure",
	);
}
