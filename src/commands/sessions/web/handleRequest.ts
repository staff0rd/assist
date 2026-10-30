import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { getBacklogSummary } from "../../backlog/web/getBacklogSummary";
import { getRepoLocation } from "../../backlog/web/getRepoLocation";
import { listItems } from "../../backlog/web/shared";
import { browserRelay } from "./browser/browserRelay";
import { daemonLogTail } from "./daemonLogTail";
import { diff } from "./diff";
import { diffScopes } from "./diffScopes";
import { docsFeedback } from "./docsFeedback/docsFeedback";
import { fileContent } from "./fileContent";
import { getClones } from "./fromGithub/getClones";
import { reviewFromGithub } from "./fromGithub/reviewFromGithub";
import { sessionFromGithub } from "./fromGithub/sessionFromGithub";
import { sessionFromGithubPreflight } from "./fromGithub/sessionFromGithubPreflight";
import { sessionFromLink } from "./fromGithub/sessionFromLink";
import { getBackupStatus } from "./getBackupStatus";
import { getBackups } from "./getBackups";
import { getConfig } from "./getConfig";
import { getHtml } from "./getHtml";
import { handleServerRuns } from "./handleServerRuns";
import { getReviewSynthesis } from "./getReviewSynthesis";
import { githubFileContent } from "./githubFileContent";
import { githubUrl } from "./githubUrl";
import { gitStatus } from "./gitStatus";
import { handleDynamicRoute } from "./handleDynamicRoute";
import { harnessCapabilities } from "./harnessCapabilities";
import { health } from "./health";
import { historySearch } from "./historySearch";
import { inboxStatus } from "./inbox/inboxStatus";
import { listInbox } from "./inbox/listInbox";
import { scanInbox } from "./inbox/scanInbox";
import { hotkeyBindings } from "./hotkeyBindings";
import { jiraSite } from "./jiraSite";
import { listFiles } from "./listFiles";
import { listNewsItems } from "./listNewsItems";
import { newsNavConfig } from "./newsNavConfig";
import { nextItems } from "./next/nextItems";
import { nextPickup } from "./next/nextPickup";
import { listScopedRules } from "./listScopedRules";
import { listUsageHistory } from "./listUsageHistory";
import { listUsageItems } from "./listUsageItems";
import { openInCode } from "./openInCode";
import { prList } from "./prList";
import { previewImage } from "./previewImage";
import { prStatus } from "./prStatus";
import { releasesCompare } from "./releases/releasesCompare";
import { releasesConfigured } from "./releases/releasesConfigured";
import { releasesState } from "./releases/releasesState";
import { restartWeb } from "./restartWeb";
import { revertDiffFile } from "./revertDiffFile";
import { selfUpdate } from "./selfUpdate";
import { revertDiffPaths } from "./revertDiffPaths";
import { newSessionDefaults } from "./newSessionDefaults";
import { nodeDoctor } from "./nodeDoctor";
import { setConfig } from "./setConfig";
import { unsetConfig } from "./unsetConfig";
import { updates } from "./updates/updates";
import { updatesControl } from "./updates/updatesControl";
import { uploadPrImage } from "./uploadPrImage";
import { writeFileContent } from "./writeFileContent";
import { staticRoutes } from "./staticRoutes";

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
	...staticRoutes,
	"GET /api/health": health,
	"GET /api/daemon-log": daemonLogTail,
	"GET /api/items": listItems,
	"GET /api/backlog/summary": getBacklogSummary,
	"GET /api/repo-location": getRepoLocation,
	"POST /api/sessions/from-github": sessionFromGithub,
	"OPTIONS /api/sessions/from-github": sessionFromGithubPreflight,
	"POST /api/sessions/from-link": sessionFromLink,
	"OPTIONS /api/sessions/from-link": sessionFromGithubPreflight,
	"GET /api/clones": getClones,
	"POST /api/sessions/review-from-github": reviewFromGithub,
	"OPTIONS /api/sessions/review-from-github": sessionFromGithubPreflight,
	"POST /api/sessions/docs-feedback": docsFeedback,
	"OPTIONS /api/sessions/docs-feedback": sessionFromGithubPreflight,
	"POST /api/browser": browserRelay,
	"POST /api/open-in-code": openInCode,
	"POST /api/pr-preview/upload-image": uploadPrImage,
	"GET /api/pr-preview/image": previewImage,
	"POST /api/restart": restartWeb,
	"GET /api/node-doctor": nodeDoctor,
	"POST /api/self-update": selfUpdate,
	"GET /api/github-url": githubUrl,
	"GET /api/github-file": githubFileContent,
	"GET /api/git-status": gitStatus,
	"GET /api/diff": diff,
	"GET /api/diff-scopes": diffScopes,
	"POST /api/diff/revert": revertDiffFile,
	"POST /api/diff/revert-all": revertDiffPaths,
	"GET /api/file": fileContent,
	"POST /api/file": writeFileContent,
	"GET /api/files": listFiles,
	"GET /api/history/search": historySearch,
	"GET /api/rules": listScopedRules,
	"GET /api/jira-site": jiraSite,
	"GET /api/harness": harnessCapabilities,
	"GET /api/hotkeys": hotkeyBindings,
	"GET /api/new-session-defaults": newSessionDefaults,
	"GET /api/pr-status": prStatus,
	"GET /api/server-runs": handleServerRuns,
	"GET /api/pr-list": prList,
	"GET /api/next": nextItems,
	"POST /api/next/pickup": nextPickup,
	"GET /api/inbox": listInbox,
	"GET /api/inbox/status": inboxStatus,
	"POST /api/inbox/scan": scanInbox,
	"GET /api/news/items": listNewsItems,
	"GET /api/news/nav": newsNavConfig,
	"GET /api/releases/state": releasesState,
	"GET /api/releases/configured": releasesConfigured,
	"GET /api/releases/compare": releasesCompare,
	"GET /api/usage/history": listUsageHistory,
	"GET /api/usage/items": listUsageItems,
	"GET /api/backups/list": getBackups,
	"GET /api/backups/status": getBackupStatus,
	"GET /api/config": getConfig,
	"POST /api/config/set": setConfig,
	"POST /api/config/unset": unsetConfig,
	"GET /api/review/synthesis": getReviewSynthesis,
	"GET /api/updates": updates,
	"POST /api/updates/control": updatesControl,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleDynamicRoute,
);
