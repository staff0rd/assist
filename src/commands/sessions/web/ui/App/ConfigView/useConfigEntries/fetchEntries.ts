import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { withNode } from "../../../withNode";

export async function fetchEntries(
	cwd: string,
	node?: string,
): Promise<ConfigEntry[]> {
	const res = await fetch(
		withNode(`/api/config?cwd=${encodeURIComponent(cwd)}`, node),
	);
	const body = await res.json();
	if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
	return body;
}
