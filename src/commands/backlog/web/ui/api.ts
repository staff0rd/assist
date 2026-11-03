import { apiFetch } from "../../../sessions/web/ui/apiFetch";
import { formatItemId } from "../../formatItemId";
import type { DocsRefreshRequest } from "../../requestDocsRefresh";
import type { DocsRefreshView } from "../getDocsRefresh";
import type { BacklogItem } from "./types";
import { withCwd } from "./withCwd";

const DOCS_REFRESH_URL = "/api/backlog/docs-refresh";

async function sendJson<T>(
	url: string,
	method: string,
	body: unknown,
): Promise<T> {
	const res = await apiFetch(url, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${method} ${url} failed: ${res.status}`);
	return res.json();
}

export async function deleteItem(
	id: number,
	cwd?: string,
	node?: string,
): Promise<void> {
	await apiFetch(withCwd(`/api/items/${formatItemId(id)}`, cwd, node), {
		method: "DELETE",
	});
}

export function updateItemStatus(
	id: number,
	status: BacklogItem["status"],
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}`, cwd, node),
		"PATCH",
		{ status },
	);
}

export function toggleStar(
	id: number,
	starred: boolean,
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}/star`, cwd, node),
		"POST",
		{ starred },
	);
}

export function rewindPhase(
	id: number,
	phase: number,
	reason: string,
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}/rewind`, cwd, node),
		"POST",
		{
			phase,
			reason,
		},
	);
}

export async function fetchDocsRefreshState(
	cwd: string | undefined,
	node: string | undefined,
	signal?: AbortSignal,
): Promise<DocsRefreshView> {
	const res = await apiFetch(withCwd(DOCS_REFRESH_URL, cwd, node), { signal });
	return res.json();
}

export function createDocsRefresh(
	cwd: string | undefined,
	node: string | undefined,
): Promise<DocsRefreshRequest> {
	return sendJson(withCwd(DOCS_REFRESH_URL, cwd, node), "POST", {});
}
