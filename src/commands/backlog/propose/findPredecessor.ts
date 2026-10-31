import { readLedger } from "./mutateLedger";

const GRACE_MS = 5_000;
const SIBLING_WAIT_MS = 5_000;
const POLL_MS = 100;

export function knownPredecessor(
	path: string,
	startedAt: number,
): number | undefined {
	const { created } = readLedger(path);
	if (!created) return undefined;
	if (created.startedAt > startedAt) return undefined;
	if (created.at < startedAt - GRACE_MS) return undefined;
	return created.itemId;
}

function hasOlderOpenSibling(
	path: string,
	token: string,
	startedAt: number,
): boolean {
	return readLedger(path).open.some(
		(p) => p.token !== token && p.startedAt <= startedAt,
	);
}

export async function findPredecessor(
	path: string,
	token: string,
	startedAt: number,
): Promise<number | undefined> {
	const deadline = Date.now() + SIBLING_WAIT_MS;
	while (hasOlderOpenSibling(path, token, startedAt) && Date.now() < deadline)
		await new Promise((resolve) => setTimeout(resolve, POLL_MS));
	return knownPredecessor(path, startedAt);
}
