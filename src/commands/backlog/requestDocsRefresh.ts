import type { Db } from "../../shared/db/Db";
import { createDocsRefreshItem } from "./createDocsRefreshItem";
import { loadDocsRefreshState } from "./loadDocsRefreshState";

export type DocsRefreshRequest =
	| { outcome: "created"; id: number }
	| { outcome: "open"; id: number }
	| { outcome: "nothing-unswept" };

export async function requestDocsRefresh(
	orm: Db,
	origin: string,
): Promise<DocsRefreshRequest> {
	const { openId, unswept } = await loadDocsRefreshState(orm, origin);
	if (openId !== undefined) return { outcome: "open", id: openId };
	if (unswept.length === 0) return { outcome: "nothing-unswept" };
	const id = await createDocsRefreshItem(
		orm,
		origin,
		unswept.map((s) => s.id),
	);
	return { outcome: "created", id };
}
