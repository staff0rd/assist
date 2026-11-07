import { resolveHarness } from "../../../shared/harnessLabel";
import { awaitsQuestionAnswer } from "../shared/awaitsQuestionAnswer";
import { deriveCodexRolloutStatus } from "../shared/codex/deriveCodexRolloutStatus";
import { findCodexRolloutPathSync } from "../shared/codex/findCodexRolloutPathSync";
import { deriveTranscriptStatus } from "../shared/deriveTranscriptStatus";
import { readTranscriptTailSync } from "../shared/readTranscriptTail";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import type { PersistedSession } from "./loadPersistedSessions";

export type RestoreStatus = "running" | "waiting" | "asking";

export function deriveRestoreStatus(
	persisted: PersistedSession,
): RestoreStatus {
	if (resolveHarness(persisted.harness) === "codex")
		return deriveCodexRestoreStatus(persisted.harnessSessionId);
	if (!persisted.claudeSessionId) return "waiting";
	const filePath = findTranscriptPathSync(
		persisted.cwd,
		persisted.claudeSessionId,
	);
	if (!filePath) return "waiting";
	const entries = readTranscriptTailSync(filePath);
	if (deriveTranscriptStatus(entries) === "running") return "running";
	return awaitsQuestionAnswer(entries) ? "asking" : "waiting";
}

function deriveCodexRestoreStatus(
	harnessSessionId: string | undefined,
): RestoreStatus {
	const filePath = harnessSessionId
		? findCodexRolloutPathSync(harnessSessionId)
		: null;
	if (!filePath) return "waiting";
	return deriveCodexRolloutStatus(readTranscriptTailSync(filePath));
}
