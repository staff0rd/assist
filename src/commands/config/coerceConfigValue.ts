import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import type { ConfigScalarLeafType } from "../../shared/scalarUnionMembers";
import { assistConfigSchema } from "../../shared/types";
import type { ConfigScalar, ConfigWritableValue } from "./applyConfigSet";
import { coerceConfigScalar } from "./coerceConfigScalar";
import { coerceStructuredConfigValue } from "./coerceStructuredConfigValue";
import { scrubConfigKeyError } from "./scrubConfigKeyError";

type CoerceConfigValueResult =
	| { ok: true; value: ConfigWritableValue }
	| { ok: false; error: string };

const EDITABLE_TYPES = new Set([
	"string",
	"number",
	"boolean",
	"enum",
	"union",
]);

export function coerceConfigValue(
	key: string,
	raw: unknown,
): CoerceConfigValueResult {
	const result = coerceValue(key, raw);
	if (result.ok) return result;
	return { ok: false, error: scrubConfigKeyError(result.error, key, raw) };
}

function coerceValue(key: string, raw: unknown): CoerceConfigValueResult {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) return { ok: false, error: `Unknown config key "${key}"` };
	if (leaf.itemType) return coerceScalarList(key, raw, leaf.itemType);
	if (!EDITABLE_TYPES.has(leaf.type))
		return coerceStructuredConfigValue(key, raw);
	if (leaf.type === "union")
		return coerceUnion(key, raw, leaf.unionTypes ?? []);
	return coerceConfigScalar(key, raw, leaf.type as ConfigScalarLeafType);
}

export function coerceScalarList(
	key: string,
	raw: unknown,
	itemType: ConfigScalarLeafType,
): CoerceConfigValueResult {
	if (!Array.isArray(raw)) {
		return {
			ok: false,
			error: `${key}: expected a list of ${itemType} values`,
		};
	}
	const values: ConfigScalar[] = [];
	for (const item of raw) {
		const result = coerceConfigScalar(key, item, itemType);
		if (!result.ok) return result;
		values.push(result.value);
	}
	return { ok: true, value: values };
}

export function coerceUnion(
	key: string,
	raw: unknown,
	types: ConfigScalarLeafType[],
): CoerceConfigValueResult {
	for (const type of types) {
		const result = coerceConfigScalar(key, raw, type);
		if (result.ok) return result;
	}
	return { ok: false, error: `${key}: expected ${types.join(" or ")}` };
}
