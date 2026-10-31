import { randomUUID } from "node:crypto";
import { findPredecessor, knownPredecessor } from "./findPredecessor";
import { mutateLedger } from "./mutateLedger";
import { proposalLedgerPath } from "./proposalLedgerPath";

const STALE_OPEN_MS = 60 * 60_000;

export type ProposalTracker = {
	knownPredecessor: () => number | undefined;
	findPredecessor: () => Promise<number | undefined>;
	recordCreated: (itemId: number) => void;
	close: () => void;
};

export function trackProposal(sessionId: string): ProposalTracker {
	const path = proposalLedgerPath(sessionId);
	const token = randomUUID();
	const startedAt = Date.now();

	mutateLedger(path, (ledger) => {
		ledger.open = ledger.open.filter(
			(p) => startedAt - p.startedAt < STALE_OPEN_MS,
		);
		ledger.open.push({ token, startedAt });
	});

	let closed = false;
	const close = () => {
		if (closed) return;
		closed = true;
		process.off("exit", close);
		mutateLedger(path, (ledger) => {
			ledger.open = ledger.open.filter((p) => p.token !== token);
		});
	};
	process.on("exit", close);

	return {
		knownPredecessor: () => knownPredecessor(path, startedAt),
		findPredecessor: () => findPredecessor(path, token, startedAt),
		recordCreated: (itemId) =>
			mutateLedger(path, (ledger) => {
				ledger.created = { itemId, at: Date.now(), startedAt };
			}),
		close,
	};
}
