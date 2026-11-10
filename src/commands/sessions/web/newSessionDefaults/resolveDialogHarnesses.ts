import type { HarnessKind } from "../../../../shared/harnesses";
import { assistConfigSchema } from "../../../../shared/types";

const harnessShape = assistConfigSchema.shape.harness.unwrap().shape;
const engineSchema = harnessShape.engine;
const typeShape = harnessShape.defaults.unwrap().shape.draft.unwrap().shape;

const dialogTypes = ["draft", "bug", "prompt", "design"] as const;

type DialogType = (typeof dialogTypes)[number];
type DialogHarnesses = Record<DialogType, HarnessKind>;
type DialogModels = Partial<Record<DialogType, string>>;

function child(value: unknown, key: string): unknown {
	if (!value || typeof value !== "object") return undefined;
	return (value as Record<string, unknown>)[key];
}

export function resolveDialogHarnesses(
	raw: Record<string, unknown>,
): { harnesses: DialogHarnesses; models: DialogModels } | { error: string } {
	const harness = child(raw, "harness");
	const engine = engineSchema.safeParse(child(harness, "engine"));
	if (!engine.success) return { error: "harness.engine" };
	const defaults = child(harness, "defaults");
	const harnesses = {} as DialogHarnesses;
	const models: DialogModels = {};
	for (const type of dialogTypes) {
		const typeDefaults = child(defaults, type);
		const parsed = typeShape.harness.safeParse(child(typeDefaults, "harness"));
		if (!parsed.success) return { error: `harness.defaults.${type}.harness` };
		harnesses[type] = parsed.data ?? engine.data;
		const model = typeShape.model.safeParse(child(typeDefaults, "model"));
		if (!model.success) return { error: `harness.defaults.${type}.model` };
		if (model.data) models[type] = model.data;
	}
	return { harnesses, models };
}
