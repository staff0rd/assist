import { readCodexRolloutUsage } from "../shared/codex/codexRolloutUsage";
import { applyCodexUsage } from "./applyCodexUsage";
import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { Handler } from "./routed";

export const handleCodexUsage: Handler = (client, m, d) => {
	if (m.windowsProxy.route(client, d)) return;
	const sessionId = d.sessionId as string;
	if (d.ack) sendTo(client, { type: "ack", sessionId });
	void readCodexRolloutUsage(d.transcriptPath as string).then(
		(usage) => {
			if (usage.rateLimits)
				m.clients.updateHarnessLimits("codex", usage.rateLimits);
			const windows = m.clients.currentWindows("codex");
			m.update((sessions) =>
				applyCodexUsage(sessions, sessionId, usage, windows),
			);
		},
		(error) => daemonLog(`codex-usage read failed: ${String(error)}`),
	);
};
