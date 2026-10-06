import { getDb } from "../../shared/db/getDb";
import {
	type RunConfig,
	type RunEntry,
	repoConfigSchema,
} from "../../shared/types";
import { exitWithConfigErrors } from "../config/exitWithConfigErrors";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { saveSharedRepoBlock } from "../config/saveSharedRepoBlock";
import { validateConfig } from "../config/validateConfig";
import { ensureNoDuplicateRun } from "./ensureNoDuplicateRun";

export async function addRepoRunConfig(
	entry: RunConfig,
	repoName: string | undefined,
	cwd: string = process.cwd(),
): Promise<string> {
	const orm = await getDb();
	const { label, block } = await resolveSharedRepoBlock(orm, repoName, cwd);
	const runList = (block.run ?? []) as RunEntry[];
	ensureNoDuplicateRun(runList, entry.name);
	const updated = { ...block, run: [...runList, entry] };
	const validation = validateConfig(updated, "run", repoConfigSchema);
	if (!validation.ok) exitWithConfigErrors(validation.errors);
	await saveSharedRepoBlock(orm, label, updated);
	return label;
}
