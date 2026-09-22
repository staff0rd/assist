import type { z } from "zod";
import type { ConfigKeyWrite } from "./ConfigKeyWrite";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

type ApplyResult =
	| { ok: true; updated: Record<string, unknown> }
	| { ok: false; errors: string[] };

export function applyConfigWrites(
	base: Record<string, unknown>,
	writes: ConfigKeyWrite[],
	schema?: z.ZodTypeAny,
): ApplyResult {
	let updated = base;
	for (const write of writes) {
		updated = setNestedValue(updated, write.key, write.value);
		const validation = validateConfig(updated, write.key, schema);
		if (!validation.ok) return validation;
	}
	return { ok: true, updated };
}
