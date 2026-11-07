import type { PreviewStartTarget } from "./PreviewDecision";

export function toStartTarget(value: unknown): PreviewStartTarget | undefined {
	const target = value as Partial<PreviewStartTarget> | undefined;
	if (typeof target?.node !== "string" || !target.node) return undefined;
	if (typeof target.cwd !== "string" || !target.cwd) return undefined;
	return { node: target.node, cwd: target.cwd };
}
