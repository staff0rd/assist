import { resolveHarness } from "../../../shared/harnessLabel";
import type { HarnessKind } from "../../../shared/harnesses";
import { hasCodexRolloutSync } from "../shared/codex/hasCodexRolloutSync";
import { hasTranscriptOnDisk } from "./hasTranscriptOnDisk";

export function resumableConversationId(session: {
	cwd?: string;
	harness?: HarnessKind;
	claudeSessionId?: string;
	harnessSessionId?: string;
}): string | undefined {
	const harness = resolveHarness(session.harness);
	if (harness === "claude")
		return hasTranscriptOnDisk(session) ? session.claudeSessionId : undefined;
	if (harness === "codex" && session.harnessSessionId)
		return hasCodexRolloutSync(session.harnessSessionId)
			? session.harnessSessionId
			: undefined;
	return undefined;
}
