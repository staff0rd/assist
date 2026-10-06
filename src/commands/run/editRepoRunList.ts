import { getDb } from "../../shared/db/getDb";
import { type RunEntry, repoConfigSchema } from "../../shared/types";
import { exitWithConfigErrors } from "../config/exitWithConfigErrors";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { saveSharedRepoBlock } from "../config/saveSharedRepoBlock";
import { validateConfig } from "../config/validateConfig";

export async function editRepoRunList(
	repoName: string | undefined,
	cwd: string,
	edit: (runList: RunEntry[], label: string) => RunEntry[],
): Promise<string> {
	const orm = await getDb();
	const { label, block } = await resolveSharedRepoBlock(orm, repoName, cwd);
	const run = edit((block.run ?? []) as RunEntry[], label);
	const updated = { ...block, run };
	const validation = validateConfig(updated, "run", repoConfigSchema);
	if (!validation.ok) exitWithConfigErrors(validation.errors);
	await saveSharedRepoBlock(orm, label, updated);
	return label;
}
