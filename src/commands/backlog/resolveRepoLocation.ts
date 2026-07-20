import { existsSync } from "node:fs";
import { cloneTargetDir } from "./cloneTargetDir";
import { getCurrentOrigin } from "./getCurrentOrigin";

type RepoLocation = { cwd?: string; cloneTarget?: string };

export function resolveRepoLocation(
	origin: string,
	knownCwd: string | undefined,
	baseDir: string,
): RepoLocation {
	if (knownCwd) return { cwd: knownCwd };
	const target = cloneTargetDir(origin, baseDir);
	if (!target) return {};
	if (existsSync(target) && getCurrentOrigin(target) === origin)
		return { cwd: target };
	return { cloneTarget: target };
}
