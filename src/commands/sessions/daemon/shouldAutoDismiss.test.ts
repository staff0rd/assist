import { describe, expect, it } from "vitest";
import type { Session } from "./createSession";
import { shouldAutoDismiss } from "./shouldAutoDismiss";

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "assist",
		status: "done",
		startedAt: 1,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

describe("shouldAutoDismiss", () => {
	describe("when a draft --once session exits cleanly", () => {
		it("dismisses", () => {
			expect(
				shouldAutoDismiss(session({ assistArgs: ["draft", "--once"] }), 0),
			).toBe(true);
		});
	});

	describe("when a bug --once session exits cleanly", () => {
		it("dismisses", () => {
			expect(
				shouldAutoDismiss(session({ assistArgs: ["bug", "--once"] }), 0),
			).toBe(true);
		});
	});

	describe("when a next --once session exits cleanly", () => {
		it("keeps", () => {
			expect(
				shouldAutoDismiss(session({ assistArgs: ["next", "--once"] }), 0),
			).toBe(false);
		});
	});

	describe("when a --once session exits with a non-zero code", () => {
		it("keeps", () => {
			expect(
				shouldAutoDismiss(session({ assistArgs: ["bug", "--once"] }), 1),
			).toBe(false);
		});
	});

	describe("when an update session exits cleanly", () => {
		it("dismisses", () => {
			expect(shouldAutoDismiss(session({ assistArgs: ["update"] }), 0)).toBe(
				true,
			);
		});
	});

	describe("when an update session exits with a non-zero code", () => {
		it("keeps", () => {
			expect(shouldAutoDismiss(session({ assistArgs: ["update"] }), 1)).toBe(
				false,
			);
		});
	});

	describe("when a non --once session exits cleanly", () => {
		it("keeps", () => {
			expect(shouldAutoDismiss(session({ assistArgs: ["bug"] }), 0)).toBe(
				false,
			);
		});
	});

	describe("when the session has no assistArgs", () => {
		it("keeps", () => {
			expect(shouldAutoDismiss(session({ assistArgs: undefined }), 0)).toBe(
				false,
			);
		});
	});

	describe("when a --once session is not yet done", () => {
		it("keeps", () => {
			expect(
				shouldAutoDismiss(
					session({ status: "running", assistArgs: ["bug", "--once"] }),
					0,
				),
			).toBe(false);
		});
	});
});
