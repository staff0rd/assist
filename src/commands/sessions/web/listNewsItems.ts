import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { listFeeds } from "../../backlog/listFeeds";
import { getReady } from "../../backlog/shared";
import { fetchFeeds } from "../../news/fetchFeeds";
import type { FeedItem } from "../../news/shared";

let cachedItems: FeedItem[] | undefined;
let inflight: Promise<FeedItem[]> | undefined;

export async function listNewsItems(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	if (!cachedItems) {
		if (!inflight)
			inflight = getReady().then(({ orm }) =>
				listFeeds(orm).then((urls) => fetchFeeds(urls)),
			);
		cachedItems = await inflight;
	}
	respondJson(res, 200, cachedItems);
}
