import type {
	BuildConfigNode,
	ConfigNodeBase,
	ConfigRecordNode,
} from "./ConfigNode";
import { configEnumDescriptions } from "./configEnumDescriptions";
import { formatConfigPath } from "./formatConfigPath";
import type { SchemaNode } from "./unwrapSchemaNode";

function enumKeyValues(
	keyType: SchemaNode | undefined,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): string[] | undefined {
	if (!keyType) return undefined;
	const key = build(keyType, base.path);
	return key.kind === "scalar" ? key.enumValues : undefined;
}

export function recordConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): ConfigRecordNode | undefined {
	const valueType = inner.def?.valueType;
	if (inner.def?.type !== "record" || !valueType) return undefined;
	const value = build(valueType, [...base.path, { kind: "entry" }]);
	const keyValues = enumKeyValues(inner.def?.keyType, base, build);
	const keyDescriptions = keyValues
		? configEnumDescriptions(formatConfigPath(base.path))
		: undefined;
	return {
		...base,
		kind: "record",
		value,
		...(keyValues ? { keyValues } : {}),
		...(keyDescriptions ? { keyDescriptions } : {}),
	};
}
