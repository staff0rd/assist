import { getDb } from "../../shared/db/getDb";
import { globalOnlyRepoKeyError } from "./globalOnlyRepoKeyError";
import { resolveSharedRepoBlock } from "./resolveSharedRepoBlock";
import { saveSharedRepoBlock } from "./saveSharedRepoBlock";
import { unsetRepoBlockKey } from "./unsetRepoBlockKey";

type SharedRepoConfigUnsetResult =
	| { ok: true; target: "repo"; label: string; removed: boolean }
	| { ok: false; errors: string[] };

export async function applySharedRepoConfigUnset(
	key: string,
	repoName?: string,
	cwd: string = process.cwd(),
): Promise<SharedRepoConfigUnsetResult> {
	const globalOnly = globalOnlyRepoKeyError(key, "Unset");
	if (globalOnly) return globalOnly;
	const orm = await getDb();
	const { label, block } = await resolveSharedRepoBlock(orm, repoName, cwd);
	const unset = unsetRepoBlockKey(block, key);
	if (!unset.ok) return unset;
	if (unset.removed) await saveSharedRepoBlock(orm, label, unset.block);
	return { ok: true, target: "repo", label, removed: unset.removed };
}
