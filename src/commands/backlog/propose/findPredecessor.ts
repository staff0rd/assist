import { type CreatedItem, readLedger } from "./mutateLedger";

const SIBLING_WAIT_MS = 5_000;
const POLL_MS = 100;

export type Predecessor = { itemId: number; runStarted: boolean };

function supersededCreation(
	path: string,
	superseded: readonly string[],
): CreatedItem | undefined {
	const { created } = readLedger(path);
	if (!created?.token || !superseded.includes(created.token)) return undefined;
	return created;
}

export function knownPredecessor(
	path: string,
	superseded: readonly string[],
): number | undefined {
	const created = supersededCreation(path, superseded);
	return created && !created.runStarted ? created.itemId : undefined;
}

function hasOpenSuperseded(path: string, superseded: readonly string[]) {
	return readLedger(path).open.some((p) => superseded.includes(p.token));
}

export async function findPredecessor(
	path: string,
	superseded: readonly string[],
): Promise<Predecessor | undefined> {
	const deadline = Date.now() + SIBLING_WAIT_MS;
	while (hasOpenSuperseded(path, superseded) && Date.now() < deadline)
		await new Promise((resolve) => setTimeout(resolve, POLL_MS));
	const created = supersededCreation(path, superseded);
	return created
		? { itemId: created.itemId, runStarted: created.runStarted === true }
		: undefined;
}
