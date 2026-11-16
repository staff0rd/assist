import {
	type DeclaredNode,
	declaredNode,
	NODE_VERSION_KEY,
} from "../../../../shared/nodeRuntime/declaredNode";
import type { NodeSpecResolution } from "../../../../shared/nodeRuntime/NodeSpecResolution";
import { resolveNodeSpec } from "../../../../shared/nodeRuntime/resolveNodeSpec";
import { findNodePin } from "./findNodePin";

type InstallNode =
	| { ok: true; binDir: string | undefined; description: string }
	| { ok: false; error: string };

type ResolveInstallNodeDeps = {
	resolve: (spec: string) => NodeSpecResolution;
	declared: () => DeclaredNode | undefined;
};

const defaultDeps: ResolveInstallNodeDeps = {
	resolve: (spec) => resolveNodeSpec(spec),
	declared: declaredNode,
};

export function resolveInstallNode(
	dir: string,
	root: string,
	deps: ResolveInstallNodeDeps = defaultDeps,
): InstallNode {
	const pin = findNodePin(dir, root);
	if (!pin) return unpinnedNode(deps.declared());
	const resolution = deps.resolve(pin.spec);
	if (!resolution.ok)
		return {
			ok: false,
			error: `${pin.file} pins node "${pin.spec}" but it could not be resolved: ${resolution.error}`,
		};
	const { binDir, version } = resolution.node;
	return {
		ok: true,
		binDir,
		description: `node v${version} (${binDir}) pinned by ${pin.file}`,
	};
}

function unpinnedNode(declared: DeclaredNode | undefined): InstallNode {
	if (!declared?.ok)
		return {
			ok: true,
			binDir: undefined,
			description: `the login shell's default node (no .node-version or .nvmrc, and ${NODE_VERSION_KEY} ${declared ? "unresolved" : "unset"})`,
		};
	const { binDir, version } = declared.node;
	return {
		ok: true,
		binDir,
		description: `the daemon's node v${version} (${binDir}) from ${NODE_VERSION_KEY}; no .node-version or .nvmrc`,
	};
}
