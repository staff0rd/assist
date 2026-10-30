import { approvedScriptRunner } from "./approvedScriptRunner";
import type { browserApi } from "./browserApi";
import { executeApprovedScript } from "./executeApprovedScript";
import { probeReply } from "./probeReply";
import type { BrowserReply, ProbeAnswer, RunDecision } from "./types";

type Api = NonNullable<ReturnType<typeof browserApi>>;

export async function runApprovedScript(
	api: Api,
	tabId: number,
	tabUrl: string,
	askTab: () => Promise<ProbeAnswer | undefined>,
	code: string,
): Promise<BrowserReply<"run">> {
	const runner = await approvedScriptRunner(api);
	if (typeof runner === "string") return { ok: false, tabUrl, error: runner };
	const approval = probeReply("run", tabUrl, await askTab());
	if (!approval.ok) return approval;
	const { decision } = approval.result as unknown as { decision: RunDecision };
	if (decision !== "run")
		return { ok: true, result: { tabUrl, outcome: decision } };
	const outcome = await executeApprovedScript(runner, tabId, code);
	return { ok: true, result: { tabUrl, ...outcome } };
}
