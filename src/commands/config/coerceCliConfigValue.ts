import { describeConfigLeaves } from "../../shared/describeConfigLeaves";
import { assistConfigSchema } from "../../shared/types";
import type { ConfigWritableValue } from "./applyConfigSet";
import {
	coerceConfigValue,
	coerceScalarList,
	coerceUnion,
} from "./coerceConfigValue";
import { configKeyNode } from "./configKeyNode";

type CoerceCliConfigValueResult =
	| { ok: true; value: ConfigWritableValue }
	| { ok: false; error: string };

export function coerceCliConfigValue(
	key: string,
	raw: string,
): CoerceCliConfigValueResult {
	const leaf = describeConfigLeaves(assistConfigSchema).find(
		(candidate) => candidate.key === key,
	);
	if (!leaf) return coerceIndexedValue(key, raw);
	if (leaf.itemType) return coerceConfigValue(key, splitList(raw));
	return coerceConfigValue(key, raw);
}

function coerceIndexedValue(
	key: string,
	raw: string,
): CoerceCliConfigValueResult {
	const node = configKeyNode(key.replace(/\.(\d+)(?=\.|$)/g, "[$1]"));
	if (node?.kind === "scalarList")
		return coerceScalarList(key, splitList(raw), node.itemType);
	if (node?.kind !== "scalar")
		return { ok: true, value: coerceWithoutSchemaLeaf(raw) };
	return coerceUnion(
		key,
		raw,
		node.type === "union" ? (node.unionTypes ?? []) : [node.type],
	);
}

function splitList(raw: string): string[] {
	return raw
		.split(",")
		.map((item) => item.trim())
		.filter((item) => item !== "");
}

function coerceWithoutSchemaLeaf(raw: string): string | boolean {
	if (raw === "true") return true;
	if (raw === "false") return false;
	return raw;
}
