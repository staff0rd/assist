import { currentDeclared } from "./currentDeclared";
import type { NodeRuntimeReport } from "./NodeRuntimeReport";
import { nodeRuntimeMismatch } from "./nodeRuntimeMismatch";
import { readNodeRuntimeReport } from "./readNodeRuntimeReport";

export function localNodeRuntime(): NodeRuntimeReport | undefined {
	const report = readNodeRuntimeReport();
	if (!report) return undefined;
	const declared = currentDeclared();
	return {
		...report,
		declared,
		mismatch: nodeRuntimeMismatch(report.node, declared),
	};
}
