import type { ConfigRecordNode } from "../../../../../../../../../shared/ConfigNode";

export function emptyConfigEntryValue(node: ConfigRecordNode): unknown {
	const kind = node.value.kind;
	if (kind === "scalarList" || kind === "objectList") return [];
	if (kind === "object" || kind === "unionOfObjects") return {};
	return "";
}
