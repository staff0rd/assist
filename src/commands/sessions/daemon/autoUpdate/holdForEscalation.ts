import type { AutoUpdateDeps } from "./AutoUpdateDeps";

export const ESCALATION_POLL_MS = 5000;

export async function holdForEscalation(
	sessionId: string,
	deps: AutoUpdateDeps,
): Promise<void> {
	deps.note(`paused while session ${sessionId} reconciles the divergence`);
	while (deps.isLive(sessionId)) await deps.sleep(ESCALATION_POLL_MS);
	deps.note(`session ${sessionId} ended; resuming`);
}
