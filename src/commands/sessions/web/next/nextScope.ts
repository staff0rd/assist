import { resolveCurrentOrigin } from "../../../backlog/getCurrentOrigin";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { forkBaseRepo } from "../forkBaseRepo";
import type { NextScope } from "./types";

const GITHUB = "github.com/";
const DEFAULT_PICK_STATUSES = ["Ready", "Todo"];

function githubRepo(cwd: string): string | null {
	const { origin } = resolveCurrentOrigin(cwd);
	if (!origin.startsWith(GITHUB)) return null;
	const base = forkBaseRepo(cwd);
	return base ? `${base.org}/${base.repo}` : origin.slice(GITHUB.length);
}

export function nextScope(cwd: string): NextScope {
	const next = loadConfigFrom(cwd).next;
	return {
		selfRepo: githubRepo(cwd),
		peers: next?.peers ?? [],
		repos: next?.repos ?? null,
		projects: next?.projects ?? [],
		pickStatuses: next?.pickStatuses ?? DEFAULT_PICK_STATUSES,
		excludeLabels: next?.excludeLabels ?? [],
		excludeTypes: next?.excludeTypes ?? [],
		repoRules: next?.repoRules ?? {},
	};
}
