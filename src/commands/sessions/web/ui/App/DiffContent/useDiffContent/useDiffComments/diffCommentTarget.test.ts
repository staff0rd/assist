import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { diffCommentTarget } from "./diffCommentTarget";

const live = { id: "daemon-1", claudeSessionId: "claude-1" };
const sessions = [makeSessionInfo({ ...live, status: "running" })];

describe("diffCommentTarget", () => {
	it("resolves the claude session id to the live daemon session", () => {
		expect(diffCommentTarget(sessions, "claude-1")).toEqual({
			session: sessions[0],
		});
	});

	it("explains that the diff was opened without a session", () => {
		const { session, unavailable } = diffCommentTarget(sessions, undefined);

		expect(session).toBeUndefined();
		expect(unavailable).toContain("session card");
	});

	it("explains that the session is gone", () => {
		const { session, unavailable } = diffCommentTarget(sessions, "claude-gone");

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});

	it("rejects a session that has stopped", () => {
		const stopped = [makeSessionInfo({ ...live, status: "stopped" })];

		const { session, unavailable } = diffCommentTarget(stopped, "claude-1");

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});

	it("rejects a session that is closing", () => {
		const closing = [
			makeSessionInfo({ ...live, status: "running", closing: true }),
		];

		const { session, unavailable } = diffCommentTarget(closing, "claude-1");

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});
});
