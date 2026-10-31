import { answerConsoleRequest } from "../consoleCapture/answerConsoleRequest";
import { browserApi } from "./browserApi";
import { checkForUpdate } from "./checkForUpdate";
import { probeReply } from "./probeReply";
import { resolveTargetTab } from "./resolveTargetTab";
import { runApprovedScript } from "./runApprovedScript";
import {
	BROWSER_PROBE_TYPE,
	type BrowserReply,
	type BrowserRequest,
	type ProbeAnswer,
} from "./types";

export async function runBrowserRequest(
	request: BrowserRequest,
): Promise<BrowserReply> {
	const api = browserApi();
	if (!api) return { ok: false, error: "browser tabs API unavailable" };
	if (request.op === "update") return checkForUpdate(api);
	if (request.op === "console" && request.all)
		return answerConsoleRequest(request);
	const tab = await resolveTargetTab(api, request.url);
	if ("ok" in tab) return tab;
	if (request.op === "console") return answerConsoleRequest(request, tab);
	const askTab = () =>
		api.tabs
			.sendMessage(tab.id, { ...request, type: BROWSER_PROBE_TYPE })
			.then((reply) => reply as ProbeAnswer | undefined)
			.catch(() => undefined);
	if (request.op === "run")
		return runApprovedScript(api, tab.id, tab.url, askTab, request.code);
	return probeReply(request.op, tab.url, await askTab());
}
