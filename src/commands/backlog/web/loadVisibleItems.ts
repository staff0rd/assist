import type { IncomingMessage } from "node:http";
import { loadBacklog, searchBacklog } from "../shared";
import type { BacklogItem } from "../types";

const completedStatuses = new Set(["done", "wontdo"]);

/**
 * Load the backlog (or search results) for the web list, honouring the
 * `showCompleted` query param so done/wontdo items stay off the wire by default.
 */
export async function loadVisibleItems(
	req: IncomingMessage,
): Promise<BacklogItem[]> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const q = params.get("q");
	const loaded = q ? await searchBacklog(q) : await loadBacklog();
	if (params.get("showCompleted") === "true") return loaded;
	return loaded.filter((item) => !completedStatuses.has(item.status));
}
