import { normalizeLines, sourceOf } from "./sourceOf";
import type { DiffUnit } from "./toDiffUnits";

export function keyOf(unit: DiffUnit, source: string): string {
	if (unit.kind === "node") return sourceOf(unit.node, source);
	if (unit.kind === "html") return normalizeLines(unit.part.text.trim());
	return [unit.open, ...unit.children, unit.close]
		.map((child) => keyOf(child, source))
		.join("\n");
}
