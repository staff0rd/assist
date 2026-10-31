import { apiFetch } from "../../apiFetch";
import { withNode } from "../../withNode";

export function postSelfUpdate(node?: string): Promise<Response> {
	return apiFetch(withNode("/api/self-update", node), {
		method: "POST",
		timeoutMs: 660_000,
	});
}
