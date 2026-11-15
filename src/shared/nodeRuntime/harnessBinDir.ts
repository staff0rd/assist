import { declaredNode } from "./declaredNode";

export function harnessBinDir(): string | undefined {
	const declared = declaredNode();
	return declared?.ok ? declared.node.binDir : undefined;
}
