import { resolveCurrentOrigin } from "../../../backlog/getCurrentOrigin";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import type { NextScope } from "./types";

const GITHUB = "github.com/";
const DEFAULT_PICK_STATUSES = ["Ready", "Todo"];

function githubRepo(cwd: string): string | null {
	const { origin } = resolveCurrentOrigin(cwd);
	return origin.startsWith(GITHUB) ? origin.slice(GITHUB.length) : null;
}

export function nextScope(cwd: string): NextScope {
	const next = loadConfigFrom(cwd).next;
	return {
		selfRepo: githubRepo(cwd),
		peers: next?.peers ?? [],
		repos: next?.repos ?? null,
		projects: next?.projects ?? [],
		pickStatuses: next?.pickStatuses ?? DEFAULT_PICK_STATUSES,
	};
}
