import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createBundleHandler } from "../../../shared/createBundleHandler";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { createItem } from "../../backlog/web/createItem";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { listItems } from "../../backlog/web/shared";
import { getHtml } from "./getHtml";

const require = createRequire(import.meta.url);

function createCssHandler(packageEntry: string): Handler {
	let cache: string | undefined;
	return (_req, res) => {
		if (!cache) {
			const resolved = require.resolve(packageEntry);
			cache = readFileSync(resolved, "utf-8");
		}
		res.writeHead(200, { "Content-Type": "text/css" });
		res.end(cache);
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
	"POST /api/items": createItem,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
