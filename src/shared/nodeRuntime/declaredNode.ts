import { loadConfig } from "../loadConfig";
import type { NodeSpecResolution } from "./NodeSpecResolution";
import { resolveNodeSpec } from "./resolveNodeSpec";

export const NODE_VERSION_KEY = "sessions.nodeVersion";

export type DeclaredNode = { spec: string } & NodeSpecResolution;

const resolved = new Map<string, NodeSpecResolution>();

function readSpec(): string | undefined {
	try {
		return loadConfig().sessions?.nodeVersion?.trim() || undefined;
	} catch {
		return undefined;
	}
}

export function declaredNode(): DeclaredNode | undefined {
	const spec = readSpec();
	if (!spec) return undefined;
	let resolution = resolved.get(spec);
	if (!resolution) {
		resolution = resolveNodeSpec(spec);
		if (resolution.ok) resolved.set(spec, resolution);
	}
	return { spec, ...resolution };
}
