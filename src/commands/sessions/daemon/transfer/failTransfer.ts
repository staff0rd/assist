import type { SessionClient } from "../broadcast";
import type { Session } from "../createSession";
import { refuseTransfer } from "./refuseTransfer";
import type { TransferDeps } from "./TransferDeps";

export function failTransfer(
	client: SessionClient,
	deps: TransferDeps,
	s: Session,
	target: string,
	error: string,
): void {
	s.transfer = { target, error };
	deps.notify();
	refuseTransfer(client, s.id, error);
}
