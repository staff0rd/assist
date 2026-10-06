import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../../../../types";
import { matchIssueSessions } from "./matchIssueSessions";

function session(id: string, overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status: "running",
		startedAt: 0,
		remoteOrigin: "github.com/o/r",
		...overrides,
	};
}

const ids = (sessions: SessionInfo[]) => sessions.map((s) => s.id);
const none = new Map<string, string>();

describe("matchIssueSessions", () => {
	it("matches a session launched for the issue from the Next view", () => {
		const sessions = [
			session("1", { promptIssue: "O/R#12" }),
			session("2", { promptIssue: "o/r#13" }),
		];
		expect(ids(matchIssueSessions(sessions, none, "o/r", 12))).toEqual(["1"]);
	});

	it("matches a session running a backlog item tracking the issue", () => {
		const sessions = [
			session("1", { commandType: "assist" }),
			session("2", { commandType: "assist" }),
		];
		const tracked = new Map([
			["1", "o/r#12"],
			["2", "o/r#7"],
		]);
		expect(ids(matchIssueSessions(sessions, tracked, "o/r", 12))).toEqual([
			"1",
		]);
	});

	it("skips a session in another repo", () => {
		const sessions = [
			session("1", {
				promptIssue: "o/r#12",
				remoteOrigin: "github.com/o/other",
			}),
			session("2", { remoteOrigin: "github.com/o/other" }),
		];
		const tracked = new Map([["2", "o/r#12"]]);
		expect(matchIssueSessions(sessions, tracked, "o/r", 12)).toEqual([]);
	});

	it("skips a reviewer of a PR with the same number", () => {
		const sessions = [session("1", { assistArgs: ["review", "12"] })];
		expect(matchIssueSessions(sessions, none, "o/r", 12)).toEqual([]);
	});
});
