import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import semver from "semver";
import { nodeAtPath } from "./nodeAtPath";
import { nodeForRange } from "./nodeForRange";
import type { NodeSpecResolution, ResolveNodeDeps } from "./NodeSpecResolution";

function defaultDeps(): ResolveNodeDeps {
	return {
		home: homedir(),
		env: process.env,
		platform: process.platform,
		current: { path: process.execPath, version: process.version },
		versionOf: (path) =>
			execFileSync(path, ["--version"], {
				encoding: "utf8",
				timeout: 10_000,
				windowsHide: true,
			}).trim(),
	};
}

function isPathSpec(spec: string): boolean {
	return /[/\\]/.test(spec) || spec.startsWith("~");
}

export function resolveNodeSpec(
	spec: string,
	deps: ResolveNodeDeps = defaultDeps(),
	highest = false,
): NodeSpecResolution {
	const trimmed = spec.trim();
	if (isPathSpec(trimmed)) return nodeAtPath(trimmed, deps);
	const range = semver.validRange(trimmed.replace(/^v/, ""));
	if (!range)
		return {
			ok: false,
			error: "not a node version (e.g. 24, 24.22.1) or a path to a node binary",
		};
	return nodeForRange(range, deps, highest);
}
