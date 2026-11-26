import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

type OpenProposal = { token: string; startedAt: number };
export type CreatedItem = {
	itemId: number;
	token: string;
	runStarted?: boolean;
};
type Ledger = { open: OpenProposal[]; created?: CreatedItem };

export function readLedger(path: string): Ledger {
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8")) as Partial<Ledger>;
		return { open: parsed.open ?? [], created: parsed.created };
	} catch {
		return { open: [] };
	}
}

export function mutateLedger(
	path: string,
	mutate: (ledger: Ledger) => void,
): void {
	const ledger = readLedger(path);
	mutate(ledger);
	mkdirSync(dirname(path), { recursive: true });
	const tmp = `${path}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(ledger));
	renameSync(tmp, path);
}
