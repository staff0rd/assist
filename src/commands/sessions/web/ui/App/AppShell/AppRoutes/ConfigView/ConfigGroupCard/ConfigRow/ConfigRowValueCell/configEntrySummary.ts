import type { ConfigNode } from "../../../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../../../shared/configNodeFieldName";
import { asConfigRecord } from "./asConfigRecord";
import { pickObjectVariant } from "./pickObjectVariant";

export function configEntrySummary(node: ConfigNode, value: unknown): string {
	const variant =
		node.kind === "unionOfObjects"
			? pickObjectVariant(node.variants, value)
			: node;
	const record = asConfigRecord(value) ?? {};
	const fields = variant?.kind === "object" ? variant.fields : [];

	for (const field of fields) {
		const name = configNodeFieldName(field);
		const entry = name === undefined ? undefined : record[name];
		if (
			field.kind === "scalar" &&
			!field.secret &&
			entry !== undefined &&
			entry !== ""
		)
			return String(entry);
	}
	return "new entry";
}
