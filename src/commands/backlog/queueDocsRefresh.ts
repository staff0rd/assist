import type { Db } from "../../shared/db/Db";
import { createDocsRefreshItem } from "./createDocsRefreshItem";
import { loadDocsRefreshState } from "./loadDocsRefreshState";

export async function queueDocsRefresh(
	orm: Db,
	origin: string,
	threshold: number,
): Promise<number | undefined> {
	const { openId, unswept } = await loadDocsRefreshState(orm, origin);
	if (openId !== undefined || unswept.length < threshold) return undefined;
	return createDocsRefreshItem(
		orm,
		origin,
		unswept.map((s) => s.id),
	);
}
