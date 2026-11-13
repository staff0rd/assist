import { describe, expect, it } from "vitest";
import type { HistoricalSession } from "../types";
import { mergeRepos } from "../mergeRepos";

function entry(
	cwd: string,
	repoGroup?: HistoricalSession["repoGroup"],
	node?: string,
): HistoricalSession {
	return {
		sessionId: `${node ?? "local"}-${cwd}`,
		name: "s",
		project: "p",
		cwd,
		timestamp: "2026-01-01",
		repoGroup,
		node,
	};
}

const keysOf = (repos: { key: string }[]) => repos.map((r) => r.key);

describe("mergeRepos with clone.baseDir repos", () => {
	it("appends repos with no sessions after history, sorted by name", () => {
		const history = [entry("/git/zeta"), entry("/git/alpha")];
		expect(
			keysOf(mergeRepos("", history, ["/git/mid", "/git/beta", "/git/zeta"])),
		).toEqual(["/git/zeta", "/git/alpha", "/git/beta", "/git/mid"]);
	});

	it("skips a repo already listed through a session's repoGroup clone", () => {
		const history = [
			entry("/git/app-2", { origin: "github.com/org/app", clone: "/git/app" }),
		];
		const repos = mergeRepos("", history, ["/git/app", "/git/other"]);
		expect(repos).toEqual([
			{
				key: "github.com/org/app",
				origin: "github.com/org/app",
				clones: { "": "/git/app" },
			},
			{ key: "/git/other", clones: { "": "/git/other" } },
		]);
	});

	it("skips the current cwd", () => {
		expect(keysOf(mergeRepos("/git/here", [], ["/git/here"]))).toEqual([
			"/git/here",
		]);
	});

	it("adds base repos to the local node only, not peers", () => {
		const history = [entry("/git/peer-app", undefined, "peer")];
		expect(mergeRepos("", history, ["/git/app"])).toEqual([
			{
				key: "/git/peer-app",
				origin: undefined,
				clones: { peer: "/git/peer-app" },
			},
			{ key: "/git/app", clones: { "": "/git/app" } },
		]);
	});

	it("lists only history repos when the base dir has none", () => {
		const history = [entry("/git/app")];
		expect(mergeRepos("", history, [])).toEqual(mergeRepos("", history));
	});
});
