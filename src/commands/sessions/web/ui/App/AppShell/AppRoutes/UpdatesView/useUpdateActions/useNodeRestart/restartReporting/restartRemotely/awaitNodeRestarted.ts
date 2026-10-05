import type { RestartTarget } from "../../../../../../../../../../../watch/restartRules";
import { fetchNodeUpdate } from "../../../../../../fetchNodeUpdate";
import type { NodeUpdateEntry } from "../../../../../../NodeUpdateEntry";

const POLL_MS = 2_000;
const TIMEOUT_MS = 90_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function awaitNodeRestarted(
	entry: NodeUpdateEntry,
	targets: RestartTarget[],
): Promise<NodeUpdateEntry | undefined> {
	const deadline = Date.now() + TIMEOUT_MS;
	while (Date.now() < deadline) {
		await wait(POLL_MS);
		const next = await fetchNodeUpdate(entry.name, entry.local);
		const status = next.status;
		if (
			status?.daemonReachable &&
			!targets.some((t) => status.restart.includes(t))
		)
			return next;
	}
	return undefined;
}
