import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createBundleHandler } from "../../../shared/createBundleHandler";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { getBacklogExists } from "../../backlog/web/getBacklogExists";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { initBacklog } from "../../backlog/web/initBacklog";
import { listItems } from "../../backlog/web/shared";
import { getBackups } from "./getBackups";
import { getHtml } from "./getHtml";
import { githubUrl } from "./githubUrl";
import { gitStatus } from "./gitStatus";
import { listNewsItems } from "./listNewsItems";
import { listUsageHistory } from "./listUsageHistory";
import { openInCode } from "./openInCode";
import { prList } from "./prList";
import { prStatus } from "./prStatus";
import { restartWeb } from "./restartWeb";

const require = createRequire(import.meta.url);

function createCssHandler(packageEntry: string): Handler {
	let cache: { body: string; etag: string } | undefined;
	return (req, res) => {
		if (!cache) {
			const resolved = require.resolve(packageEntry);
			const body = readFileSync(resolved, "utf8");
			const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`;
			cache = { body, etag };
		}
		const headers = { ETag: cache.etag, "Cache-Control": "no-cache" };
		if (req.headers["if-none-match"] === cache.etag) {
			res.writeHead(304, headers);
			res.end();
			return;
		}
		res.writeHead(200, { "Content-Type": "text/css", ...headers });
		res.end(cache.body);
	};
}

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.js",
	),
	"GET /xterm.css": createCssHandler("@xterm/xterm/css/xterm.css"),
	"GET /api/items": listItems,
	"GET /api/backlog/exists": getBacklogExists,
	"POST /api/backlog/init": initBacklog,
	"POST /api/open-in-code": openInCode,
	"POST /api/restart": restartWeb,
	"GET /api/github-url": githubUrl,
	"GET /api/git-status": gitStatus,
	"GET /api/pr-status": prStatus,
	"GET /api/pr-list": prList,
	"GET /api/news/items": listNewsItems,
	"GET /api/usage/history": listUsageHistory,
	"GET /api/backups/list": getBackups,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
