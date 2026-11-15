import { existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import type { NodeSpecResolution, ResolveNodeDeps } from "./NodeSpecResolution";

export function nodeAtPath(
	spec: string,
	deps: ResolveNodeDeps,
): NodeSpecResolution {
	const expanded = spec.replace(/^~(?=$|[/\\])/, deps.home);
	if (!existsSync(expanded))
		return { ok: false, error: `${expanded} does not exist` };
	const candidates = statSync(expanded).isDirectory()
		? ["bin/node", "node", "node.exe"].map((name) => join(expanded, name))
		: [expanded];
	const path = candidates.find((candidate) => existsSync(candidate));
	if (!path) return { ok: false, error: `no node binary in ${expanded}` };
	try {
		const version = deps.versionOf(path).replace(/^v/, "");
		return { ok: true, node: { path, binDir: dirname(path), version } };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { ok: false, error: `${path} --version failed: ${message}` };
	}
}
