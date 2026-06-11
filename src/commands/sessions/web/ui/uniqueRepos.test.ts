import { describe, expect, it } from "vitest";
import type { HistoricalSession } from "./types";
import { uniqueRepos } from "./uniqueRepos";

function session(cwd: string): HistoricalSession {
	return {
		sessionId: cwd,
		name: cwd,
		project: cwd,
		cwd,
		timestamp: cwd,
	};
}

describe("uniqueRepos", () => {
	it("orders repos by most recent session, newest first", () => {
		const history = [
			session("/repo/c"),
			session("/repo/a"),
			session("/repo/b"),
		];
		expect(uniqueRepos("/repo/a", history)).toEqual([
			"/repo/c",
			"/repo/a",
			"/repo/b",
		]);
	});

	it("places the cwd at the top when it has no matching session", () => {
		const history = [session("/repo/a"), session("/repo/b")];
		expect(uniqueRepos("/repo/new", history)).toEqual([
			"/repo/new",
			"/repo/a",
			"/repo/b",
		]);
	});

	it("lets the cwd fall into its recency slot when it has a session", () => {
		const history = [
			session("/repo/a"),
			session("/repo/b"),
			session("/repo/c"),
		];
		expect(uniqueRepos("/repo/b", history)).toEqual([
			"/repo/a",
			"/repo/b",
			"/repo/c",
		]);
	});

	it("de-dupes repos, keeping the newest occurrence", () => {
		const history = [
			session("/repo/a"),
			session("/repo/b"),
			session("/repo/a"),
			session("/repo/c"),
			session("/repo/b"),
		];
		expect(uniqueRepos("", history)).toEqual(["/repo/a", "/repo/b", "/repo/c"]);
	});

	it("ignores sessions without a cwd", () => {
		const history = [
			session("/repo/a"),
			{ ...session(""), cwd: "" },
			session("/repo/b"),
		];
		expect(uniqueRepos("", history)).toEqual(["/repo/a", "/repo/b"]);
	});

	it("returns an empty list when there is no cwd or history", () => {
		expect(uniqueRepos("", [])).toEqual([]);
	});
});
