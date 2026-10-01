import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../../../../types";
import { matchPrSessions } from "./matchPrSessions";

function session(id: string, overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id,
		name: id,
		commandType: "assist",
		status: "running",
		startedAt: 0,
		remoteOrigin: "github.com/o/r",
		...overrides,
	};
}

const ids = (sessions: SessionInfo[]) => sessions.map((s) => s.id);

describe("matchPrSessions", () => {
	it("matches review, review-pr-comments and fix-conflict sessions on the PR", () => {
		const sessions = [
			session("1", { assistArgs: ["review", "12"] }),
			session("2", { assistArgs: ["review-pr-comments", "12"] }),
			session("3", { assistArgs: ["fix-conflict"], subtitle: "#12 · bob" }),
		];
		expect(ids(matchPrSessions(sessions, "o/r", 12))).toEqual(["1", "2", "3"]);
	});

	it("skips sessions on another PR or not reviewing one", () => {
		const sessions = [
			session("1", { assistArgs: ["review", "13"] }),
			session("2", { assistArgs: ["backlog", "run", "12"] }),
			session("3", { commandType: "claude" }),
		];
		expect(matchPrSessions(sessions, "o/r", 12)).toEqual([]);
	});

	it("skips a session reviewing the same number in another repo", () => {
		const sessions = [
			session("1", {
				assistArgs: ["review", "12"],
				remoteOrigin: "github.com/o/other",
			}),
			session("2", {
				assistArgs: ["review", "12"],
				remoteOrigin: "local:/tmp/r",
			}),
		];
		expect(matchPrSessions(sessions, "o/r", 12)).toEqual([]);
	});

	it("falls back to the clone's origin and ignores case", () => {
		const sessions = [
			session("1", {
				assistArgs: ["review", "12"],
				remoteOrigin: undefined,
				repoGroup: { origin: "github.com/O/R", clone: "/git/r" },
			}),
		];
		expect(ids(matchPrSessions(sessions, "O/r", 12))).toEqual(["1"]);
	});
});
