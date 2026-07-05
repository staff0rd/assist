import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCurrentOrigin } from "../getCurrentOrigin";
import { loadRepoSummaries } from "../loadRepoSummaries";
import { getOrigin } from "../shared";

export async function getBacklogSummary(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd") ?? undefined;
	const knownCwds = url.searchParams.getAll("knownCwd");
	const currentOrigin = cwd ? getCurrentOrigin(cwd) : getOrigin();
	respondJson(res, 200, await loadRepoSummaries(currentOrigin, knownCwds));
}
