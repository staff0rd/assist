import type { NodeUpdateStatus } from "../../../../../../shared/NodeUpdateStatus";
import { withNode } from "../../../../withNode";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";

export async function fetchNodeUpdate(
	name: string,
	local: boolean,
): Promise<NodeUpdateEntry> {
	try {
		const res = await fetch(withNode("/api/updates", local ? undefined : name));
		const body = await res.json();
		if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
		return { name, local, status: body as NodeUpdateStatus };
	} catch (error) {
		return {
			name,
			local,
			error:
				error instanceof Error ? error.message : "Failed to load update state",
		};
	}
}
