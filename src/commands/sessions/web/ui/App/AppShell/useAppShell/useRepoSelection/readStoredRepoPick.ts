import type { RepoPick } from "./resolveSelectedNode";
import { REPO_PICK_KEY } from "./storeRepoPick";

function optionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

export function readStoredRepoPick(): RepoPick | undefined {
	try {
		const raw = localStorage.getItem(REPO_PICK_KEY);
		if (!raw) return undefined;
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const cwd = optionalString(parsed.cwd);
		if (!cwd) return undefined;
		return {
			cwd,
			node: optionalString(parsed.node),
			origin: optionalString(parsed.origin),
		};
	} catch {
		return undefined;
	}
}
