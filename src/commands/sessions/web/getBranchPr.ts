import { currentPrSelector } from "../../prs/currentPrSelector";
import { createCachedGhJson } from "./createCachedGhJson";
import type { PrSummary } from "./prList";
import { getCurrentBranch } from "./getCurrentBranch";
import { type GhPr, prFields, toPrSummary } from "./toPrSummary";

const getOpenPrForBranch = createCachedGhJson<PrSummary | null>(
	["pr", "list", "--state", "open", "--json", prFields],
	(stdout) => {
		const parsed = JSON.parse(stdout) as GhPr[];
		if (!Array.isArray(parsed) || parsed.length === 0) return null;
		return toPrSummary(parsed[0]);
	},
	null,
	{ cacheFallback: false },
);

const getOpenPrBySelector = createCachedGhJson<PrSummary | null>(
	["pr", "view", "--json", `${prFields},state`],
	(stdout) => {
		const parsed = JSON.parse(stdout) as GhPr & { state?: string };
		return parsed.state === "OPEN" ? toPrSummary(parsed) : null;
	},
	null,
	{ cacheFallback: false },
);

export async function getBranchPr(
	cwd: string,
	base: { org: string; repo: string } | null,
): Promise<PrSummary | null> {
	const branch = await getCurrentBranch(cwd);
	if (!branch) return null;
	if (!base) return getOpenPrForBranch(cwd, ["--head", branch]);
	return getOpenPrBySelector(cwd, [
		currentPrSelector(branch, base.org, cwd),
		"-R",
		`${base.org}/${base.repo}`,
	]);
}
