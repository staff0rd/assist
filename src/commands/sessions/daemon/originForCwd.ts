import { getCurrentOrigin } from "../../backlog/getCurrentOrigin";

const cache = new Map<string, string>();

export function originForCwd(cwd: string | undefined): string | undefined {
	if (!cwd) return undefined;
	const cached = cache.get(cwd);
	if (cached !== undefined) return cached;
	const origin = getCurrentOrigin(cwd);
	cache.set(cwd, origin);
	return origin;
}
