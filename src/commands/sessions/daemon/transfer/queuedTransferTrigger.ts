import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { runQueuedTransfer } from "./runQueuedTransfer";
import { type TransferHost, transferDepsFor } from "./transferDepsFor";

export type TriggerHost = TransferHost & {
	clients: { viewers: () => Set<SessionClient> };
	dismissSession: (id: string, closeServerRuns?: boolean) => void;
};

export function queuedTransferTrigger(
	host: TriggerHost,
): (s: Session, phaseEnded?: boolean) => Promise<void> | undefined {
	const viewers: SessionClient = {
		send: (raw) => {
			for (const viewer of host.clients.viewers()) viewer.send(raw);
		},
	};
	return (s, phaseEnded) =>
		runQueuedTransfer(viewers, transferDepsFor(host), s, phaseEnded);
}
