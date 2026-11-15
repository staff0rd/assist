import { declaredNode } from "../../../../shared/nodeRuntime/declaredNode";
import type { NodeRuntimeReport } from "./NodeRuntimeReport";

export function currentDeclared(): NodeRuntimeReport["declared"] {
	const declared = declaredNode();
	if (!declared) return undefined;
	return declared.ok
		? {
				spec: declared.spec,
				version: declared.node.version,
				path: declared.node.path,
			}
		: { spec: declared.spec, error: declared.error };
}
