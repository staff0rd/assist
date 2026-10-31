import { fetchNodeUpdate } from "./fetchNodeUpdate";
import type { NodeUpdateEntry } from "./NodeUpdateEntry";

const POLL_MS = 2_000;
const TIMEOUT_MS = 90_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function awaitNodeStatus(
	entry: NodeUpdateEntry,
	done: (next: NodeUpdateEntry) => boolean,
): Promise<NodeUpdateEntry | undefined> {
	const deadline = Date.now() + TIMEOUT_MS;
	while (Date.now() < deadline) {
		await wait(POLL_MS);
		const next = await fetchNodeUpdate(entry.name, entry.local);
		if (done(next)) return next;
	}
	return undefined;
}
