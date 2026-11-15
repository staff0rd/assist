import { declaredNode } from "./declaredNode";

export function assistNodePath(): string {
	const declared = declaredNode();
	return declared?.ok ? declared.node.path : process.execPath;
}
