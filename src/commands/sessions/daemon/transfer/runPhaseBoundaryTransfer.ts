import type { Session } from "../createSession";
import {
	queuedTransferTrigger,
	type TriggerHost,
} from "./queuedTransferTrigger";

const pendingTransfers = new Map<string, Promise<void>>();

export function phaseLaunchHold(sessionId: string): Promise<void> | undefined {
	return pendingTransfers.get(sessionId);
}

export function runPhaseBoundaryTransfer(host: TriggerHost, s: Session): void {
	const run = queuedTransferTrigger(host)(s, true);
	if (!run) return;
	const settled = run.finally(() => pendingTransfers.delete(s.id));
	pendingTransfers.set(s.id, settled);
}
