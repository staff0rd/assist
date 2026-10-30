import type { NodeUpdateStatus } from "../../../../shared/NodeUpdateStatus";
import { apiFetch } from "../../apiFetch";
import { withNode } from "../../withNode";
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
		const body = await res.json();
		if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
		return { name, local, status: body as NodeUpdateStatus };
	} catch (error) {
		return { name, local, error: failureMessage(error) };
	}
}

function failureMessage(error: unknown): string {
	if (error instanceof DOMException && error.name === "TimeoutError")
		return `No response after ${UPDATE_TIMEOUT_MS / 1000}s`;
	return error instanceof Error ? error.message : "Failed to load update state";
}
