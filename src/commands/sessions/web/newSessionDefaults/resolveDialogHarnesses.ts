import type { HarnessKind } from "../../../../shared/harnesses";
import { assistConfigSchema } from "../../../../shared/types";

const harnessShape = assistConfigSchema.shape.harness.unwrap().shape;
const engineSchema = harnessShape.engine;
const typeHarnessSchema = harnessShape.defaults.unwrap().shape.draft.unwrap()
	.shape.harness;

const dialogTypes = ["draft", "bug", "prompt", "design"] as const;

type DialogHarnesses = Record<(typeof dialogTypes)[number], HarnessKind>;

function child(value: unknown, key: string): unknown {
	if (!value || typeof value !== "object") return undefined;
	return (value as Record<string, unknown>)[key];
}

export function resolveDialogHarnesses(
	raw: Record<string, unknown>,
): { harnesses: DialogHarnesses } | { error: string } {
	const harness = child(raw, "harness");
	const engine = engineSchema.safeParse(child(harness, "engine"));
	if (!engine.success) return { error: "harness.engine" };
	const defaults = child(harness, "defaults");
	const harnesses = {} as DialogHarnesses;
	for (const type of dialogTypes) {
		const parsed = typeHarnessSchema.safeParse(
			child(child(defaults, type), "harness"),
		);
		if (!parsed.success) return { error: `harness.defaults.${type}.harness` };
		harnesses[type] = parsed.data ?? engine.data;
	}
	return { harnesses };
}
