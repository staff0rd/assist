import type { Usage } from "@openai/codex-sdk";
import { readCodexRolloutUsage } from "../../../shared/codex/codexRolloutUsage";
import { findCodexRolloutPath } from "../../../shared/codex/findCodexRolloutPath";
import { daemonLog } from "../../daemonLog";
import { sdkUsageSink } from "../sdkUsageSink";

export async function recordCodexTurnUsage(
	label: string,
	sessionId: string | undefined,
	threadId: string | null,
	usage: Usage,
): Promise<void> {
	daemonLog(
		`${label} codex turn usage: thread ${threadId ?? "unknown"} in ${usage.input_tokens} (cached ${usage.cached_input_tokens}) out ${usage.output_tokens}`,
	);
	const sink = sdkUsageSink();
	if (!sink || !sessionId || !threadId) return;
	try {
		const rollout = await findCodexRolloutPath(threadId);
		if (!rollout) {
			daemonLog(`${label} codex turn usage: no rollout for thread ${threadId}`);
			return;
		}
		sink.session(sessionId, "codex", await readCodexRolloutUsage(rollout));
	} catch (error) {
		daemonLog(
			`${label} codex turn usage read failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
