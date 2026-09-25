import type { ConfigObjectNode } from "../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../shared/configNodeFieldName";
import { asConfigRecord } from "../../asConfigRecord";

export function keepVariantFields(
	variant: ConfigObjectNode,
	value: unknown,
): Record<string, unknown> {
	const record = asConfigRecord(value) ?? {};
	const names = new Set(variant.fields.map(configNodeFieldName));
	return Object.fromEntries(
		Object.entries(record).filter(([name]) => names.has(name)),
	);
}
