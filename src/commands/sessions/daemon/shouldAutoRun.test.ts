import { describe, expect, it } from "vitest";
import type { Session } from "./createSession";
import { shouldAutoRun } from "./shouldAutoRun";

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "assist",
		status: "done",
		startedAt: 1,
		pty: null,
		scrollback: "",
		idleTimer: null,
		lastResizeAt: 0,
		autoRun: true,
		assistArgs: ["draft", "--once"],
		activity: { kind: "command", itemId: 42, startedAt: 1 },
		...overrides,
	};
}

describe("shouldAutoRun", () => {
	describe("when a draft session with autoRun and a created item exits cleanly", () => {
		it("runs", () => {
			expect(shouldAutoRun(session(), 0)).toBe(true);
		});
	});

	describe("when a bug session with autoRun and a created item exits cleanly", () => {
		it("runs", () => {
			expect(shouldAutoRun(session({ assistArgs: ["bug", "--once"] }), 0)).toBe(
				true,
			);
		});
	});

	describe("when autoRun is off", () => {
		it("does not run", () => {
			expect(shouldAutoRun(session({ autoRun: false }), 0)).toBe(false);
		});
	});

	describe("when the session exits with a non-zero code", () => {
		it("does not run", () => {
			expect(shouldAutoRun(session(), 1)).toBe(false);
		});
	});

	describe("when no item was created", () => {
		it("does not run", () => {
			expect(shouldAutoRun(session({ activity: undefined }), 0)).toBe(false);
		});
	});

	describe("when the session is a next session", () => {
		it("does not run", () => {
			expect(
				shouldAutoRun(session({ assistArgs: ["next", "--once"] }), 0),
			).toBe(false);
		});
	});

	describe("when the session is not yet done", () => {
		it("does not run", () => {
			expect(shouldAutoRun(session({ status: "running" }), 0)).toBe(false);
		});
	});

	describe("when the session is not an assist session", () => {
		it("does not run", () => {
			expect(shouldAutoRun(session({ commandType: "run" }), 0)).toBe(false);
		});
	});
});
