import { loadProjectConfig } from "../../shared/loadConfig";
import type { ConfigKeyScope } from "../config/writeConfigKeys";
import { resolveRepoConfigBlock } from "../config/resolveRepoConfigBlock";

function streamsOf(block: Record<string, unknown>): Record<string, unknown>[] {
	const releases = block.releases;
	if (releases === null || typeof releases !== "object") return [];
	const streams = (releases as Record<string, unknown>).streams;
	return Array.isArray(streams) ? (streams as Record<string, unknown>[]) : [];
}

export function declaredStreamsInScope(
	scope: ConfigKeyScope,
	cwd: string = process.cwd(),
): Record<string, unknown>[] {
	if (scope === "repo")
		return streamsOf(resolveRepoConfigBlock(undefined, cwd).block);
	return streamsOf(loadProjectConfig(cwd));
}
