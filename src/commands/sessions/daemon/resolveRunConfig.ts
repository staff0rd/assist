import {
	getConfigDirFrom,
	loadConfigFrom,
} from "../../../shared/loadConfigFrom";
import { resolveRunConfigs } from "../../../shared/resolveRunConfigs";
import type { RunConfig } from "../../../shared/types";

export function resolveRunConfig(
	name: string,
	cwd: string,
): RunConfig | undefined {
	try {
		const { run } = loadConfigFrom(cwd);
		const configs = resolveRunConfigs(run, getConfigDirFrom(cwd));
		const exact = configs.find((r) => r.name === name);
		if (exact) return exact;
		const suffixMatches = configs.filter((r) => r.name.endsWith(`:${name}`));
		return suffixMatches.length === 1 ? suffixMatches[0] : undefined;
	} catch {
		return undefined;
	}
}
