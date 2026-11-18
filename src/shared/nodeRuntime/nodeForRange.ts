import { dirname } from "node:path";
import semver from "semver";
import { findInstalledNodes } from "./findInstalledNodes";
import type { NodeSpecResolution, ResolveNodeDeps } from "./NodeSpecResolution";

function resolved(path: string, version: string): NodeSpecResolution {
	return { ok: true, node: { path, binDir: dirname(path), version } };
}

/* why: an exact pin keeps the running node when it fits (no needless switch),
 * but an open range such as engines `>=22` should get the newest install. */
export function nodeForRange(
	range: string,
	deps: ResolveNodeDeps,
	highest = false,
): NodeSpecResolution {
	const current = {
		path: deps.current.path,
		version: deps.current.version.replace(/^v/, ""),
	};
	const currentFits = semver.satisfies(current.version, range);
	if (currentFits && !highest) return resolved(current.path, current.version);
	const installed = findInstalledNodes(deps);
	const candidates = currentFits ? [current, ...installed] : installed;
	const best = semver.maxSatisfying(
		candidates.map((node) => node.version),
		range,
	);
	const match = candidates.find((node) => node.version === best);
	if (!match)
		return {
			ok: false,
			error: `no installed node satisfies it (searched fnm, nvm and volta; found ${
				installed.map((node) => node.version).join(", ") || "none"
			})`,
		};
	return resolved(match.path, match.version);
}
