import type { IncomingMessage } from "node:http";
import {
	loadBacklogSummaries,
	searchBacklogSummaries,
} from "../loadBacklogSummaries";
import type { BacklogItemSummary, BacklogStatus } from "../types";
import { type BacklogFilter, parseBacklogFilter } from "./parseBacklogFilter";

const doneStatuses = new Set<BacklogStatus>(["done", "wontdo"]);
const todoStatuses = new Set<BacklogStatus>(["todo", "in-progress"]);

function matchesFilter(status: BacklogStatus, filter: BacklogFilter): boolean {
	if (filter === "all") return true;
	if (filter === "done") return doneStatuses.has(status);
	return todoStatuses.has(status);
}

/**
 * Load lightweight item summaries (or search results) for the web list,
 * honouring the `filter` query param (todo | done | all, defaulting to todo) so
 * completed items stay off the wire by default. Relations are never loaded here
 * — they load on demand when an individual item is opened.
 */
export async function loadVisibleItems(
	req: IncomingMessage,
): Promise<BacklogItemSummary[]> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const q = params.get("q");
	const filter = parseBacklogFilter(params.get("filter"));
	const loaded = q
		? await searchBacklogSummaries(q)
		: await loadBacklogSummaries();
	return loaded.filter((item) => matchesFilter(item.status, filter));
}
