import type { RepoConfigLeafChange } from "./diffRepoConfigLeaves";
import { getNestedValue } from "./getNestedValue";
import { planValue } from "./planValue";
import { userDbKeyError } from "./userDbKeyError";
import { validateConfig } from "./validateConfig";

export type UserConfigImportPlan = {
	imported: string[];
	missing: string[];
	changes: RepoConfigLeafChange[];
	merged: Record<string, unknown>;
	errors: string[];
};

export function planUserConfigImport(
	ymlRaw: Record<string, unknown>,
	userDb: Record<string, unknown>,
	keys: string[],
): UserConfigImportPlan {
	const plan: UserConfigImportPlan = {
		imported: [],
		missing: [],
		changes: [],
		merged: userDb,
		errors: [],
	};
	for (const key of keys) {
		const nodeOnly = userDbKeyError(key, "Set");
		if (nodeOnly) {
			plan.errors.push(...nodeOnly.errors);
			continue;
		}
		const incoming = getNestedValue(ymlRaw, key);
		if (incoming === undefined) {
			plan.missing.push(key);
			continue;
		}
		const step = planValue(plan.merged, key, incoming);
		plan.imported.push(key);
		plan.merged = step.merged;
		plan.changes.push(...step.changes);
	}
	const validation = validateConfig(plan.merged, keys[0] ?? "");
	if (!validation.ok) plan.errors.push(...validation.errors);
	return plan;
}
