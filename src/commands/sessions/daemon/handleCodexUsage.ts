import { readCodexRolloutUsage } from "../shared/codex/codexRolloutUsage";
import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { recordHarnessUsage } from "./recordHarnessUsage";
import type { Handler } from "./routed";

export const handleCodexUsage: Handler = (client, m, d) => {
	if (m.links.route(client, d)) return;
	const sessionId = d.sessionId as string;
	daemonLog(`codex-usage received: id=${sessionId}`);
	if (d.ack) sendTo(client, { type: "ack", sessionId });
	void readCodexRolloutUsage(d.transcriptPath as string).then(
		(usage) => recordHarnessUsage(m, sessionId, "codex", usage),
		(error) => daemonLog(`codex-usage read failed: ${String(error)}`),
	);
};
