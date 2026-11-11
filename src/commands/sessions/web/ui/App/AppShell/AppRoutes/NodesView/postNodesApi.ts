import { apiFetch } from "../../../../apiFetch";
import { failedResponseError } from "../../../../failedResponseError";

export type DaemonReload =
	| { kind: "reloaded" }
	| { kind: "not-running" }
	| { kind: "failed"; message: string };

export async function postNodesApi<T>(
	action: "probe" | "link" | "unlink",
	body: Record<string, string>,
): Promise<T> {
	const res = await apiFetch(`/api/nodes/${action}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok)
		throw new Error((await failedResponseError(res)) ?? `HTTP ${res.status}`);
	return (await res.json()) as T;
}
