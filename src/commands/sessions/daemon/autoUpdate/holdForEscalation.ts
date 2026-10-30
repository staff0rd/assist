import type { AutoUpdateDeps } from "./AutoUpdateDeps";

export const ESCALATION_POLL_MS = 5000;

export async function holdForEscalation(
	sessionId: string,
	deps: AutoUpdateDeps,
): Promise<void> {
	deps.takeHoldRelease();
	deps.enter("diverged", { escalationId: sessionId });
	deps.note(`paused while session ${sessionId} reconciles the divergence`);
	while (deps.isLive(sessionId)) {
		await deps.sleep(ESCALATION_POLL_MS);
		if (deps.takeHoldRelease()) {
			deps.note(`check requested while session ${sessionId} is open; resuming`);
			return;
		}
	}
	deps.note(`session ${sessionId} ended; resuming`);
}
