import type {
	ConfigNode,
	ConfigScalarNode,
} from "../../../../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../../../../shared/configNodeFieldName";
import { asConfigRecord } from "../asConfigRecord";
import { pickObjectVariant } from "../pickObjectVariant";

export function normalizeConfigValue(
	node: ConfigNode,
	value: unknown,
): unknown {
	switch (node.kind) {
		case "scalar":
			return node.secret ? value : normalizeScalar(node, value);
		case "scalarList":
		case "objectList":
			return asArray(value).map((item) =>
				normalizeConfigValue(node.item, item),
			);
		case "object":
			return normalizeFields(node.fields, value);
		case "unionOfObjects": {
			const variant = pickObjectVariant(node.variants, value);
			return variant ? normalizeFields(variant.fields, value) : value;
		}
		case "record":
			return mapEntries(value, (entry) =>
				normalizeConfigValue(node.value, entry),
			);
		default:
			return value;
	}
}

function normalizeScalar(node: ConfigScalarNode, value: unknown): unknown {
	if (node.type === "boolean") return value === true;
	if (value === undefined || value === null) return "";
	if (node.type !== "number" || typeof value !== "string") return value;
	const parsed = Number(value);
	return value.trim() !== "" && Number.isFinite(parsed) ? parsed : value;
}

function normalizeFields(fields: ConfigNode[], value: unknown): unknown {
	const record = asConfigRecord(value);
	if (!record) return value;
	const out: Record<string, unknown> = { ...record };
	for (const field of fields) {
		const name = configNodeFieldName(field);
		if (!name || out[name] === undefined) continue;
		out[name] = normalizeConfigValue(field, out[name]);
	}
	return out;
}

function mapEntries(value: unknown, map: (entry: unknown) => unknown): unknown {
	const record = asConfigRecord(value) ?? {};
	return Object.fromEntries(
		Object.entries(record).map(([key, entry]) => [key, map(entry)]),
	);
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}
