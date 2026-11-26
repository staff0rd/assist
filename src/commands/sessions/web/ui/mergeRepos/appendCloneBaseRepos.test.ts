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

const base = (...cwds: string[]) => cwds.map((cwd) => ({ cwd }));

describe("mergeRepos with clone.baseDir repos", () => {
	it("appends repos with no sessions after history, sorted by name", () => {
		const history = [entry("/git/zeta"), entry("/git/alpha")];
		expect(
			keysOf(
				mergeRepos("", history, base("/git/mid", "/git/beta", "/git/zeta")),
			),
		).toEqual(["/git/zeta", "/git/alpha", "/git/beta", "/git/mid"]);
	});

	it("skips a repo already listed through a session's repoGroup clone", () => {
		const history = [
			entry("/git/app-2", { origin: "github.com/org/app", clone: "/git/app" }),
		];
		const repos = mergeRepos("", history, base("/git/app", "/git/other"));
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
		expect(keysOf(mergeRepos("/git/here", [], base("/git/here")))).toEqual([
			"/git/here",
		]);
	});

	it("adds base repos to the local node only, not peers", () => {
		const history = [entry("/git/peer-app", undefined, "peer")];
		expect(mergeRepos("", history, base("/git/app"))).toEqual([
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

	it("joins a base repo to the history repo sharing its origin on another node", () => {
		const history = [
			entry(
				String.raw`C:\git\project-switch`,
				{
					origin: "github.com/staff0rd/project-switch",
					clone: String.raw`C:\git\project-switch`,
				},
				"work-win",
			),
		];
		const repos = mergeRepos("", history, [
			{
				cwd: "/home/u/git/project-switch",
				origin: "github.com/staff0rd/project-switch",
			},
		]);
		expect(repos).toEqual([
			{
				key: "github.com/staff0rd/project-switch",
				origin: "github.com/staff0rd/project-switch",
				clones: {
					"work-win": String.raw`C:\git\project-switch`,
					"": "/home/u/git/project-switch",
				},
			},
		]);
	});

	it("keeps an existing local clone when a base repo on another path shares its origin", () => {
		const history = [
			entry("/mnt/c/git/project-switch", {
				origin: "github.com/staff0rd/project-switch",
				clone: "/mnt/c/git/project-switch",
			}),
		];
		const repos = mergeRepos("", history, [
			{
				cwd: "/home/u/git/project-switch",
				origin: "github.com/staff0rd/project-switch",
			},
		]);
		expect(repos).toEqual([
			{
				key: "github.com/staff0rd/project-switch",
				origin: "github.com/staff0rd/project-switch",
				clones: { "": "/mnt/c/git/project-switch" },
			},
		]);
	});

	it("lists a base repo whose origin matches no history repo on its own", () => {
		const history = [
			entry("/git/app", { origin: "github.com/org/app", clone: "/git/app" }),
		];
		expect(
			keysOf(
				mergeRepos("", history, [
					{ cwd: "/git/tool", origin: "github.com/org/tool" },
				]),
			),
		).toEqual(["github.com/org/app", "/git/tool"]);
	});
});
