import type { PendingRuleChange } from "../../../../../rules/types";
import { apiFetch } from "../../apiFetch";
import { withNode } from "../../withNode";

export async function fetchRuleChanges(
	cwd: string,
	node: string | undefined,
): Promise<PendingRuleChange[]> {
	const res = await apiFetch(
		withNode(`/api/rules/changes?cwd=${encodeURIComponent(cwd)}`, node),
	);
	const body = (await res.json()) as { changes?: PendingRuleChange[] };
	return body.changes ?? [];
}
