import { getDb } from "../../shared/db/getDb";
import { loadProjectConfig } from "../../shared/loadConfig";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import type { ConfigKeyScope } from "../config/writeConfigKeys";

function streamsOf(block: Record<string, unknown>): Record<string, unknown>[] {
	const releases = block.releases;
	if (releases === null || typeof releases !== "object") return [];
	const streams = (releases as Record<string, unknown>).streams;
	return Array.isArray(streams) ? (streams as Record<string, unknown>[]) : [];
}

export async function declaredStreamsInScope(
	scope: ConfigKeyScope,
	cwd: string = process.cwd(),
): Promise<Record<string, unknown>[]> {
	if (scope !== "repo") return streamsOf(loadProjectConfig(cwd));
	const { block } = await resolveSharedRepoBlock(await getDb(), undefined, cwd);
	return streamsOf(block);
}
