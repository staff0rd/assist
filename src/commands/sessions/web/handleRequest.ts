import { createBundleHandler } from "../../../shared/createBundleHandler";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { getBacklogSummary } from "../../backlog/web/getBacklogSummary";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { listItems } from "../../backlog/web/shared";
import { getBackups } from "./getBackups";
import { getHtml } from "./getHtml";
import { handleServerRuns } from "./handleServerRuns";
import { getReviewSynthesis } from "./getReviewSynthesis";
import { githubUrl } from "./githubUrl";
import { gitStatus } from "./gitStatus";
import { harnessCapabilities } from "./harnessCapabilities";
import { jiraSite } from "./jiraSite";
import { listNewsItems } from "./listNewsItems";
import { listUsageHistory } from "./listUsageHistory";
import { openInCode } from "./openInCode";
import { prList } from "./prList";
import { prStatus } from "./prStatus";
import { restartWeb } from "./restartWeb";
import { createCssHandler } from "./createCssHandler";

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.js",
	),
	"GET /xterm.css": createCssHandler("@xterm/xterm/css/xterm.css"),
	"GET /api/items": listItems,
	"GET /api/backlog/summary": getBacklogSummary,
	"POST /api/open-in-code": openInCode,
	"POST /api/restart": restartWeb,
	"GET /api/github-url": githubUrl,
	"GET /api/git-status": gitStatus,
	"GET /api/jira-site": jiraSite,
	"GET /api/harness": harnessCapabilities,
	"GET /api/pr-status": prStatus,
	"GET /api/server-runs": handleServerRuns,
	"GET /api/pr-list": prList,
	"GET /api/news/items": listNewsItems,
	"GET /api/usage/history": listUsageHistory,
	"GET /api/backups/list": getBackups,
	"GET /api/review/synthesis": getReviewSynthesis,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
