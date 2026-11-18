import { findEnginesPin } from "./findEnginesPin";
import { findNodePin, type NodePin } from "./findNodePin";
import { findRepoRoot } from "./findRepoRoot";
import type { NodeSpecResolution } from "./NodeSpecResolution";
import { resolveNodeSpec } from "./resolveNodeSpec";

export type RepoNode = { pin: NodePin } & NodeSpecResolution;

const resolved = new Map<string, NodeSpecResolution>();

function cachedResolve(spec: string): NodeSpecResolution {
	const hit = resolved.get(spec);
	if (hit) return hit;
	const resolution = resolveNodeSpec(spec);
	if (resolution.ok) resolved.set(spec, resolution);
	return resolution;
}

export function repoNode(
	cwd: string,
	resolve: (spec: string) => NodeSpecResolution = cachedResolve,
): RepoNode | undefined {
	const root = findRepoRoot(cwd) ?? cwd;
	const pin = findNodePin(cwd, root) ?? findEnginesPin(cwd, root);
	if (!pin) return undefined;
	return { pin, ...resolve(pin.spec) };
}
