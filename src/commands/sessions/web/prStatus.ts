import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { createCachedGhJson } from "./createCachedGhJson";
import { forkBaseRepo } from "./forkBaseRepo";
import { getCwdParam } from "./getCwdParam";
import type { PrSummary } from "./prList";
import { getBranchPr } from "./getBranchPr";
import { type GhPr, prFields, toPrSummary } from "./toPrSummary";

const getPrByNumber = createCachedGhJson<PrSummary | null>(
	["pr", "view", "--json", prFields],
	(stdout) => toPrSummary(JSON.parse(stdout) as GhPr),
	null,
	{ cacheFallback: false },
);

function getNumberParam(req: IncomingMessage): number | undefined {
	const raw = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"number",
	);
	if (!raw) return undefined;
	const parsed = Number(raw);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function prStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const base = forkBaseRepo(cwd);
	const number = getNumberParam(req);
	if (number !== undefined) {
		const repoArgs = base ? ["-R", `${base.org}/${base.repo}`] : [];
		respondJson(res, 200, {
			pr: await getPrByNumber(cwd, [String(number), ...repoArgs]),
		});
		return;
	}
	respondJson(res, 200, { pr: await getBranchPr(cwd, base) });
}
