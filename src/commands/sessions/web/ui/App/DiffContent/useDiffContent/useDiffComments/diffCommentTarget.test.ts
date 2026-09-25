import { describe, expect, it } from "vitest";
import { diffCommentTarget } from "./diffCommentTarget";
import type { SessionInfo } from "../../../../types";

const sessions = [
	{
		id: "daemon-1",
		claudeSessionId: "claude-1",
		name: "one",
		commandType: "claude",
		startedAt: 0,
		status: "running",
	},
] as SessionInfo[];

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
		const stopped = [{ ...sessions[0], status: "stopped" }] as SessionInfo[];

		const { session, unavailable } = diffCommentTarget(stopped, "claude-1");

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});

	it("rejects a session that is closing", () => {
		const closing = [{ ...sessions[0], closing: true }] as SessionInfo[];

		const { session, unavailable } = diffCommentTarget(closing, "claude-1");

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});
});
