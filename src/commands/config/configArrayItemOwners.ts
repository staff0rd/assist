import { configArrayMergeStrategy } from "./configArrayMergeStrategy";
import type { ConfigEntryLayers } from "./configEntryLayers";
import type { ConfigWriteScope } from "./ConfigWriteScope";

export type ConfigArrayItemOwner = {
	scope: ConfigWriteScope;
	indexInScope: number;
};

const LOWEST_TO_HIGHEST_PRECEDENCE: ConfigWriteScope[] = [
	"user",
	"global",
	"repo",
	"project",
];

type ScopeLayer = { scope: ConfigWriteScope; items: unknown[] };

type OwnedItem = ConfigArrayItemOwner & { item: unknown };

function arrayLayers(layers: ConfigEntryLayers): ScopeLayer[] {
	return LOWEST_TO_HIGHEST_PRECEDENCE.flatMap((scope) => {
		const value = layers[scope];
		return Array.isArray(value) ? [{ scope, items: value }] : [];
	});
}

function ownedItems({ scope, items }: ScopeLayer): OwnedItem[] {
	return items.map((item, indexInScope) => ({ scope, indexInScope, item }));
}

function mergeKeyOf(item: unknown, field: string): string | undefined {
	if (typeof item !== "object" || item === null) return undefined;
	const value = (item as Record<string, unknown>)[field];
	return typeof value === "string" ? value : undefined;
}

function keyedMergeOwners(layers: ScopeLayer[], field: string): OwnedItem[] {
	let merged: OwnedItem[] = [];
	for (const layer of layers) {
		const overriddenKeys = new Set(
			layer.items
				.map((item) => mergeKeyOf(item, field))
				.filter((key): key is string => key !== undefined),
		);
		const surviving = merged.filter((owned) => {
			const key = mergeKeyOf(owned.item, field);
			return key === undefined || !overriddenKeys.has(key);
		});
		merged = [...surviving, ...ownedItems(layer)];
	}
	return merged;
}

function highestPrecedenceOwners(layers: ScopeLayer[]): OwnedItem[] {
	const layer = layers.at(-1);
	return layer ? ownedItems(layer) : [];
}

export function configArrayItemOwners(
	key: string,
	layers: ConfigEntryLayers,
): ConfigArrayItemOwner[] {
	const scopeLayers = arrayLayers(layers);
	const strategy = configArrayMergeStrategy(key);
	const owned =
		strategy.kind === "keyed"
			? keyedMergeOwners(scopeLayers, strategy.field)
			: highestPrecedenceOwners(scopeLayers);
	return owned.map(({ scope, indexInScope }) => ({ scope, indexInScope }));
}
