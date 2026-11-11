import { apiFetch } from "../../../../apiFetch";
import { failedResponseError } from "../../../../failedResponseError";

export type DaemonReload =
	| { kind: "reloaded" }
	| { kind: "not-running" }
	| { kind: "failed"; message: string };

export async function requestNodeUnlink(name: string): Promise<DaemonReload> {
	const res = await apiFetch("/api/nodes/unlink", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name }),
	});
	if (!res.ok)
		throw new Error((await failedResponseError(res)) ?? `HTTP ${res.status}`);
	return ((await res.json()) as { daemon: DaemonReload }).daemon;
}
