import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { diffCommentTarget } from "./diffCommentTarget";

const live = { id: "daemon-1", claudeSessionId: "claude-1" };
const sessions = [makeSessionInfo({ ...live, status: "running" })];

const mixed = [
	makeSessionInfo({ id: "c", claudeSessionId: "claude-1", status: "running" }),
	makeSessionInfo({
		id: "peer:x",
		harness: "codex",
		harnessSessionId: "codex-1",
		node: "peer",
		status: "running",
	}),
	makeSessionInfo({
		id: "x",
		harness: "codex",
		harnessSessionId: "codex-2",
		status: "waiting",
	}),
];

describe("diffCommentTarget", () => {
	it("resolves a legacy claude session id to the live daemon session", () => {
		expect(
			diffCommentTarget(sessions, {
				conversation: { conversationId: "claude-1" },
			}),
		).toEqual({ session: sessions[0] });
	});

	it("targets the panel's own session among concurrent mixed-harness sessions", () => {
		expect(
			diffCommentTarget(mixed, {
				ownerSessionId: "x",
				conversation: { conversationId: "codex-2", harness: "codex" },
			}).session?.id,
		).toBe("x");
		expect(
			diffCommentTarget(mixed, { ownerSessionId: "peer:x" }).session?.id,
		).toBe("peer:x");
	});

	it("resolves a codex conversation without borrowing another harness's session", () => {
		expect(
			diffCommentTarget(mixed, {
				conversation: { conversationId: "codex-1", harness: "codex" },
			}).session?.id,
		).toBe("peer:x");
		expect(
			diffCommentTarget(mixed, {
				conversation: { conversationId: "claude-1", harness: "codex" },
			}).unavailable,
		).toContain("no longer live");
	});

	it("explains that the diff was opened without a session", () => {
		const { session, unavailable } = diffCommentTarget(sessions, {});

		expect(session).toBeUndefined();
		expect(unavailable).toContain("session card");
	});

	it("explains that the session is gone", () => {
		const { session, unavailable } = diffCommentTarget(sessions, {
			conversation: { conversationId: "claude-gone" },
		});

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});

	it("explains that the panel's owning session is gone", () => {
		expect(
			diffCommentTarget(mixed, { ownerSessionId: "gone" }).unavailable,
		).toContain("no longer live");
	});

	it("rejects a session that has stopped", () => {
		const stopped = [makeSessionInfo({ ...live, status: "stopped" })];

		const { session, unavailable } = diffCommentTarget(stopped, {
			ownerSessionId: "daemon-1",
		});

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});

	it("rejects a session that is closing", () => {
		const closing = [
			makeSessionInfo({ ...live, status: "running", closing: true }),
		];

		const { session, unavailable } = diffCommentTarget(closing, {
			conversation: { conversationId: "claude-1" },
		});

		expect(session).toBeUndefined();
		expect(unavailable).toContain("no longer live");
	});
});
