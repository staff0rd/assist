import type { IncomingMessage, ServerResponse } from "node:http";
import chalk from "chalk";
import { loadConfig } from "../../../shared/loadConfig";
import {
	createBundleHandler,
	createHtmlHandler,
	createRouteHandler,
	type Handler,
	respondJson,
} from "../../../shared/web";
import { fetchFeeds } from "./fetchFeeds";
import { getHtml } from "./getHtml";
import type { FeedItem } from "./shared";

let cachedItems: FeedItem[] | undefined;
let prefetchPromise: Promise<FeedItem[]> | undefined;

export function prefetch(): void {
	const config = loadConfig();
	const total = config.news.feeds.length;
	if (total === 0) return;

	process.stdout.write(chalk.dim(`Fetching ${total} feed(s)… `));

	prefetchPromise = fetchFeeds(config.news.feeds, (done, t) => {
		const width = 20;
		const filled = Math.round((done / t) * width);
		const bar = `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
		process.stdout.write(
			`\r${chalk.dim(`Fetching feeds ${bar} ${done}/${t}`)}`,
		);
	}).then((items) => {
		process.stdout.write(
			`\r${chalk.green(`Fetched ${items.length} items from ${total} feed(s)`)}\n`,
		);
		cachedItems = items;
		return items;
	});
}

async function listItems(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	if (!cachedItems && prefetchPromise) {
		await prefetchPromise;
	}
	if (!cachedItems) {
		const config = loadConfig();
		cachedItems = await fetchFeeds(config.news.feeds);
	}
	respondJson(res, 200, cachedItems);
}

const routes: Record<string, Handler> = {
	"GET /": createHtmlHandler(getHtml),
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/news/web/bundle.js",
	),
	"GET /api/items": listItems,
};

export const handleRequest = createRouteHandler(routes);
