import { repoConfigSchema } from "../../shared/types";
import { unsetNestedValue } from "./unsetNestedValue";
import { validateConfig } from "./validateConfig";

type RepoBlockUnset =
	| { ok: true; removed: false }
	| { ok: true; removed: true; block: Record<string, unknown> }
	| { ok: false; errors: string[] };

export function unsetRepoBlockKey(
	block: Record<string, unknown>,
	key: string,
): RepoBlockUnset {
	const { config: updatedBlock, removed } = unsetNestedValue(block, key);
	if (!removed) return { ok: true, removed: false };
	const validation = validateConfig(updatedBlock, key, repoConfigSchema);
	if (!validation.ok) return validation;
	return { ok: true, removed: true, block: updatedBlock };
}
