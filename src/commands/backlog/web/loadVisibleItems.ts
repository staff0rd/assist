import type { IncomingMessage } from "node:http";
import {
	loadBacklogSummaries,
	searchBacklogSummaries,
} from "../loadBacklogSummaries";
import type { BacklogItemSummary } from "../types";

const completedStatuses = new Set(["done", "wontdo"]);

/**
 * Load lightweight item summaries (or search results) for the web list,
 * honouring the `showCompleted` query param so done/wontdo items stay off the
 * wire by default. Relations are never loaded here — they load on demand when an
 * individual item is opened.
 */
export async function loadVisibleItems(
	req: IncomingMessage,
): Promise<BacklogItemSummary[]> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const q = params.get("q");
	const loaded = q
		? await searchBacklogSummaries(q)
		: await loadBacklogSummaries();
	if (params.get("showCompleted") === "true") return loaded;
	return loaded.filter((item) => !completedStatuses.has(item.status));
}
