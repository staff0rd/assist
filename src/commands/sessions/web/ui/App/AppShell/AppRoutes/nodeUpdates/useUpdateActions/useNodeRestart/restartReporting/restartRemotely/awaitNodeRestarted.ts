import type { RestartTarget } from "../../../../../../../../../../../watch/restartRules";
import { awaitNodeStatus } from "../../../../../../awaitNodeStatus";
import type { NodeUpdateEntry } from "../../../../../../NodeUpdateEntry";

export function awaitNodeRestarted(
	entry: NodeUpdateEntry,
	targets: RestartTarget[],
): Promise<NodeUpdateEntry | undefined> {
	return awaitNodeStatus(entry, ({ status }) =>
		Boolean(
			status?.daemonReachable &&
			!targets.some((t) => status.restart.includes(t)),
		),
	);
}
