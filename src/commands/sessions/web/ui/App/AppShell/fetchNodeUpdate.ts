import type { NodeUpdateStatus } from "../../../../shared/NodeUpdateStatus";
import { apiFetch } from "../../apiFetch";
import { withNode } from "../../withNode";
import { fetchLinkStatus } from "./fetchLinkStatus";
import type { NodeUpdateEntry } from "./NodeUpdateEntry";

const UPDATE_TIMEOUT_MS = 15_000;

export async function fetchNodeUpdate(
	name: string,
	local: boolean,
): Promise<NodeUpdateEntry> {
	try {
		const res = await apiFetch(
			withNode("/api/updates", local ? undefined : name),
			{
				signal: AbortSignal.timeout(UPDATE_TIMEOUT_MS),
			},
		);
		const body = await res.json().catch(() => undefined);
		const error = body?.error ?? `HTTP ${res.status}`;
		if (webServerFailed(res.status) && !local)
			return {
				name,
				local,
				error,
				webFailing: {
					httpStatus: res.status,
					daemon: await fetchLinkStatus(name),
				},
			};
		if (!res.ok) throw new Error(error);
		return { name, local, status: body as NodeUpdateStatus };
	} catch (error) {
		return { name, local, error: failureMessage(error) };
	}
}

const PROXY_UNREACHABLE = new Set([502, 504]);

function webServerFailed(status: number): boolean {
	return status >= 500 && !PROXY_UNREACHABLE.has(status);
}

function failureMessage(error: unknown): string {
	if (error instanceof DOMException && error.name === "TimeoutError")
		return `No response after ${UPDATE_TIMEOUT_MS / 1000}s`;
	return error instanceof Error ? error.message : "Failed to load update state";
}
