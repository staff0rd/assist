import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import type { SessionInfo } from "../../../../types";
import { matchPrSessions } from "./matchPrSessions";

const onRepo = {
	commandType: "assist",
	remoteOrigin: "github.com/o/r",
} satisfies Partial<SessionInfo>;

const ids = (sessions: SessionInfo[]) => sessions.map((s) => s.id);

describe("matchPrSessions", () => {
	it("matches review, review-pr-comments and fix-conflict sessions on the PR", () => {
		const sessions = [
			makeSessionInfo({ ...onRepo, id: "1", assistArgs: ["review", "12"] }),
			makeSessionInfo({
				...onRepo,
				id: "2",
				assistArgs: ["review-pr-comments", "12"],
			}),
			makeSessionInfo({
				...onRepo,
				id: "3",
				assistArgs: ["fix-conflict"],
				subtitle: "#12 · bob",
			}),
		];
		expect(ids(matchPrSessions(sessions, "o/r", 12))).toEqual(["1", "2", "3"]);
	});

	it("skips sessions on another PR or not reviewing one", () => {
		const sessions = [
			makeSessionInfo({ ...onRepo, id: "1", assistArgs: ["review", "13"] }),
			makeSessionInfo({
				...onRepo,
				id: "2",
				assistArgs: ["backlog", "run", "12"],
			}),
			makeSessionInfo({ ...onRepo, id: "3", commandType: "claude" }),
		];
		expect(matchPrSessions(sessions, "o/r", 12)).toEqual([]);
	});

	it("skips a session reviewing the same number in another repo", () => {
		const sessions = [
			makeSessionInfo({
				...onRepo,
				id: "1",
				assistArgs: ["review", "12"],
				remoteOrigin: "github.com/o/other",
			}),
			makeSessionInfo({
				...onRepo,
				id: "2",
				assistArgs: ["review", "12"],
				remoteOrigin: "local:/tmp/r",
			}),
		];
		expect(matchPrSessions(sessions, "o/r", 12)).toEqual([]);
	});

	it("falls back to the clone's origin and ignores case", () => {
		const sessions = [
			makeSessionInfo({
				...onRepo,
				id: "1",
				assistArgs: ["review", "12"],
				remoteOrigin: undefined,
				repoGroup: { origin: "github.com/O/R", clone: "/git/r" },
			}),
		];
		expect(ids(matchPrSessions(sessions, "O/r", 12))).toEqual(["1"]);
	});
});
