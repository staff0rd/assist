import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { resolveNamedRepoWriteLabel } from "../../shared/resolveNamedRepoWriteLabel";
import { SHARED_REPO_CONFIG_SOURCE } from "../../shared/resolveRepoLayer";
import { matchRepoConfigKey } from "../../shared/resolveRepoOverride";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";

type SharedRepoBlock = {
	label: string;
	block: Record<string, unknown>;
};

export async function resolveSharedRepoBlock(
	orm: Db,
	repoName: string | undefined,
	cwd: string,
): Promise<SharedRepoBlock> {
	const shared = { repos: await listRepoConfigs(orm) };
	const label =
		repoName === undefined
			? currentRepoLabel(shared, getCurrentOrigin(cwd))
			: resolveNamedRepoWriteLabel(shared, repoName, SHARED_REPO_CONFIG_SOURCE);
	return { label, block: shared.repos[label] ?? {} };
}

function currentRepoLabel(
	shared: Record<string, unknown>,
	origin: string,
): string {
	return (
		matchRepoConfigKey(shared, origin, SHARED_REPO_CONFIG_SOURCE) ?? origin
	);
}
