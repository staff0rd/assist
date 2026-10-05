import { getDb } from "../../shared/db/getDb";
import { repoConfigSchema } from "../../shared/types";
import type { ConfigWritableValue } from "./applyConfigSet";
import { globalOnlyRepoKeyError } from "./globalOnlyRepoKeyError";
import { resolveSharedRepoBlock } from "./resolveSharedRepoBlock";
import { saveSharedRepoBlock } from "./saveSharedRepoBlock";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

type SharedRepoConfigSetResult =
	| { ok: true; target: "repo"; label: string }
	| { ok: false; errors: string[] };

export async function applySharedRepoConfigSet(
	key: string,
	coerced: ConfigWritableValue,
	repoName?: string,
	cwd: string = process.cwd(),
): Promise<SharedRepoConfigSetResult> {
	const globalOnly = globalOnlyRepoKeyError(key, "Set");
	if (globalOnly) return globalOnly;
	const orm = await getDb();
	const { label, block } = await resolveSharedRepoBlock(orm, repoName, cwd);
	const updatedBlock = setNestedValue(block, key, coerced);
	const validation = validateConfig(updatedBlock, key, repoConfigSchema);
	if (!validation.ok) return validation;
	await saveSharedRepoBlock(orm, label, updatedBlock);
	return { ok: true, target: "repo", label };
}
