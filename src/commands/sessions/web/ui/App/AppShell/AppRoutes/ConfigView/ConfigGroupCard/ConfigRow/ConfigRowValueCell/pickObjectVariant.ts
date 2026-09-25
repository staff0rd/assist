import type { ConfigObjectNode } from "../../../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../../../shared/configNodeFieldName";

function matchScore(variant: ConfigObjectNode, keys: string[]): number {
	const declared = new Set(variant.fields.map(configNodeFieldName));
	let score = 0;
	for (const key of keys) score += declared.has(key) ? 1 : -1;
	return score;
}

export function pickObjectVariantIndex(
	variants: ConfigObjectNode[],
	value: unknown,
): number {
	const keys =
		typeof value === "object" && value !== null ? Object.keys(value) : [];
	let best = -1;
	let bestScore = Number.NEGATIVE_INFINITY;
	variants.forEach((variant, index) => {
		const score = matchScore(variant, keys);
		if (score > bestScore) {
			best = index;
			bestScore = score;
		}
	});
	return best;
}

export function pickObjectVariant(
	variants: ConfigObjectNode[],
	value: unknown,
): ConfigObjectNode | undefined {
	return variants[pickObjectVariantIndex(variants, value)];
}
