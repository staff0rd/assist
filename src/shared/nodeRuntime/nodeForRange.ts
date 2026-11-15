import { dirname } from "node:path";
import semver from "semver";
import { findInstalledNodes } from "./findInstalledNodes";
import type { NodeSpecResolution, ResolveNodeDeps } from "./NodeSpecResolution";

export function nodeForRange(
	range: string,
	deps: ResolveNodeDeps,
): NodeSpecResolution {
	const current = deps.current.version.replace(/^v/, "");
	if (semver.satisfies(current, range))
		return {
			ok: true,
			node: {
				path: deps.current.path,
				binDir: dirname(deps.current.path),
				version: current,
			},
		};
	const installed = findInstalledNodes(deps);
	const best = semver.maxSatisfying(
		installed.map((node) => node.version),
		range,
	);
	const match = installed.find((node) => node.version === best);
	if (!match)
		return {
			ok: false,
			error: `no installed node satisfies it (searched fnm, nvm and volta; found ${
				installed.map((node) => node.version).join(", ") || "none"
			})`,
		};
	return {
		ok: true,
		node: {
			path: match.path,
			binDir: dirname(match.path),
			version: match.version,
		},
	};
}
