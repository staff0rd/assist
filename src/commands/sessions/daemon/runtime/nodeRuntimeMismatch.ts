import { NODE_VERSION_KEY } from "../../../../shared/nodeRuntime/declaredNode";
import type { NodeRuntimeReport } from "./NodeRuntimeReport";

export function nodeRuntimeMismatch(
	node: NodeRuntimeReport["node"],
	declared: NodeRuntimeReport["declared"],
): string | undefined {
	if (!declared) return undefined;
	if (declared.error)
		return `${NODE_VERSION_KEY} "${declared.spec}" could not be resolved (${declared.error}); daemon runs on node ${node.version}`;
	if (declared.version && node.version.replace(/^v/, "") !== declared.version)
		return `daemon runs on node ${node.version} but ${NODE_VERSION_KEY} "${declared.spec}" resolves to v${declared.version}`;
	return undefined;
}
