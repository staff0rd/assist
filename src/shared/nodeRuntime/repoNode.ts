import { findEnginesPin } from "./findEnginesPin";
import { findNodePin, type NodePin } from "./findNodePin";
import { findRepoRoot } from "./findRepoRoot";
import type { NodeSpecResolution } from "./NodeSpecResolution";
import { resolveNodeSpec } from "./resolveNodeSpec";

export type RepoNode = { pin: NodePin } & NodeSpecResolution;

type Resolve = (spec: string, highest: boolean) => NodeSpecResolution;

const resolved = new Map<string, NodeSpecResolution>();

const cachedResolve: Resolve = (spec, highest) => {
	const key = `${highest}:${spec}`;
	const hit = resolved.get(key);
	if (hit) return hit;
	const resolution = resolveNodeSpec(spec, undefined, highest);
	if (resolution.ok) resolved.set(key, resolution);
	return resolution;
};

export function repoNode(
	cwd: string,
	resolve: Resolve = cachedResolve,
): RepoNode | undefined {
	const root = findRepoRoot(cwd) ?? cwd;
	const filePin = findNodePin(cwd, root);
	if (filePin) return { pin: filePin, ...resolve(filePin.spec, false) };
	const enginesPin = findEnginesPin(cwd, root);
	if (!enginesPin) return undefined;
	return { pin: enginesPin, ...resolve(enginesPin.spec, true) };
}
