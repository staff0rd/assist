import type { HarnessKind } from "../../../shared/harnesses";
import { applyCodexUsage } from "./applyCodexUsage";
import { daemonLog } from "./daemonLog";
import type { DrivenUsage } from "./sdk/sdkUsageSink";
import type { SessionManager } from "./SessionManager";

export function recordHarnessUsage(
	m: SessionManager,
	sessionId: string,
	account: HarnessKind,
	usage: DrivenUsage,
): void {
	if (usage.rateLimits)
		m.clients.updateHarnessLimits(account, usage.rateLimits);
	const windows = usage.rateLimits ? m.clients.currentWindows(account) : [];
	daemonLog(
		`${account}-usage applied: id=${sessionId} responses=${usage.responses.length} usedPct=${usage.usedPct ?? "none"} windows=${windows.length}`,
	);
	m.update((sessions) => applyCodexUsage(sessions, sessionId, usage, windows));
}
