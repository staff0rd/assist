import { createBundleHandler } from "../../../shared/createBundleHandler";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { getBacklogSummary } from "../../backlog/web/getBacklogSummary";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { listItems } from "../../backlog/web/shared";
import { diff } from "./diff";
import { diffScopes } from "./diffScopes";
import { fileContent } from "./fileContent";
import { getBackups } from "./getBackups";
import { getConfig } from "./getConfig";
import { getHtml } from "./getHtml";
import { handleServerRuns } from "./handleServerRuns";
import { getReviewSynthesis } from "./getReviewSynthesis";
import { githubUrl } from "./githubUrl";
import { gitStatus } from "./gitStatus";
import { harnessCapabilities } from "./harnessCapabilities";
import { jiraSite } from "./jiraSite";
import { listFiles } from "./listFiles";
import { listNewsItems } from "./listNewsItems";
import { listScopedRules } from "./listScopedRules";
import { listUsageHistory } from "./listUsageHistory";
import { listUsageItems } from "./listUsageItems";
import { openInCode } from "./openInCode";
import { prList } from "./prList";
import { prStatus } from "./prStatus";
import { restartWeb } from "./restartWeb";
import { revertDiffFile } from "./revertDiffFile";
import { revertDiffPaths } from "./revertDiffPaths";
import { sessionLayout } from "./sessionLayout";
import { sessionView } from "./sessionView";
import { setConfig } from "./setConfig";
import { unsetConfig } from "./unsetConfig";
import { uploadPrImage } from "./uploadPrImage";
import { writeFileContent } from "./writeFileContent";
import { createCssHandler } from "./createCssHandler";

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.js",
	),
	"GET /xterm.css": createCssHandler("@xterm/xterm/css/xterm.css"),
	"GET /bundle.css": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.css",
		"text/css",
	),
	"GET /monaco.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/monaco.js",
	),
	"GET /monaco.worker.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/monaco.worker.js",
	),
	"GET /monaco.css": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/monaco.css",
		"text/css",
	),
	"GET /api/items": listItems,
	"GET /api/backlog/summary": getBacklogSummary,
	"POST /api/open-in-code": openInCode,
	"POST /api/pr-preview/upload-image": uploadPrImage,
	"POST /api/restart": restartWeb,
	"GET /api/github-url": githubUrl,
	"GET /api/git-status": gitStatus,
	"GET /api/diff": diff,
	"GET /api/diff-scopes": diffScopes,
	"POST /api/diff/revert": revertDiffFile,
	"POST /api/diff/revert-all": revertDiffPaths,
	"GET /api/file": fileContent,
	"POST /api/file": writeFileContent,
	"GET /api/files": listFiles,
	"GET /api/rules": listScopedRules,
	"GET /api/jira-site": jiraSite,
	"GET /api/harness": harnessCapabilities,
	"GET /api/session-layout": sessionLayout,
	"GET /api/session-view": sessionView,
	"GET /api/pr-status": prStatus,
	"GET /api/server-runs": handleServerRuns,
	"GET /api/pr-list": prList,
	"GET /api/news/items": listNewsItems,
	"GET /api/usage/history": listUsageHistory,
	"GET /api/usage/items": listUsageItems,
	"GET /api/backups/list": getBackups,
	"GET /api/config": getConfig,
	"POST /api/config/set": setConfig,
	"POST /api/config/unset": unsetConfig,
	"GET /api/review/synthesis": getReviewSynthesis,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
