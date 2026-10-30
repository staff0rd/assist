import { extensionRuntime } from "../sendToAssist/extensionRuntime";
import { inspectPage } from "./inspectPage";
import { showRunApproval } from "./showRunApproval";
import {
	BROWSER_PROBE_TYPE,
	type BrowserRequest,
	type ProbeAnswer,
	RUN_APPROVAL_TIMEOUT_MS,
} from "./types";

async function answerProbe(request: BrowserRequest): Promise<ProbeAnswer> {
	try {
		if (request.op === "snapshot")
			return {
				running: true,
				result: { html: document.documentElement.outerHTML },
			};
		if (request.op === "inspect")
			return { running: true, result: inspectPage(document, request) };
		if (request.op === "run")
			return {
				running: true,
				result: {
					decision: await showRunApproval(
						request.code,
						RUN_APPROVAL_TIMEOUT_MS,
					),
				},
			};
		return { running: true };
	} catch (error) {
		return {
			running: true,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export function answerBrowserProbes(): void {
	extensionRuntime()?.onMessage.addListener((message) => {
		const probe = message as ({ type?: unknown } & BrowserRequest) | undefined;
		if (probe?.type !== BROWSER_PROBE_TYPE) return undefined;
		return answerProbe(probe);
	});
}
