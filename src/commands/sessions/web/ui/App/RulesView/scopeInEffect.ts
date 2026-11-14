import type { RuleScope } from "../../../../../rules/types";

function repoRelative(path: string, root: string): string {
	const normalized = path.trim().replaceAll("\\", "/");
	const base = root.replaceAll("\\", "/").replace(/\/+$/, "");
	const withinRoot =
		base && normalized.startsWith(`${base}/`)
			? normalized.slice(base.length + 1)
			: normalized;
	return withinRoot.replace(/^(\.\/|\/)+/, "");
}

export function scopeInEffect(
	scope: RuleScope,
	path: string,
	root = "",
): boolean {
	if (scope.kind !== "claude-md" || !scope.dir) return true;
	const relative = repoRelative(path, root);
	if (!relative) return true;
	return `${relative}/`.startsWith(scope.dir);
}
