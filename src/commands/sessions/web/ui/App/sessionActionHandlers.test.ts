import { describe, expect, it, vi } from "vitest";
import { sessionActionHandlers } from "./sessionActionHandlers";
import type { SessionInfo, SessionLifecycleHandlers } from "../types";

const handlers: SessionLifecycleHandlers = {
	onRetry: vi.fn(),
	onRestart: vi.fn(),
	onDismiss: vi.fn(),
};

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		...overrides,
	} as SessionInfo;
}

describe("sessionActionHandlers", () => {
	it("offers restart for a claude session", () => {
		const actions = sessionActionHandlers(session(), handlers);

		expect(actions.onRestart).toBeDefined();
		expect(actions.onRetry).toBeUndefined();
	});

	it("offers retry instead of restart for a run", () => {
		const actions = sessionActionHandlers(
			session({ commandType: "run" }),
			handlers,
		);

		expect(actions.onRestart).toBeUndefined();
		expect(actions.onRetry).toBeDefined();
	});

	describe("for an interactive session on a harness that cannot resume", () => {
		it("offers no restart, since the daemon has no plan to respawn it", () => {
			const actions = sessionActionHandlers(
				session({ harness: "pi" }),
				handlers,
			);

			expect(actions.onRestart).toBeUndefined();
		});
	});

	describe("for an assist session on a harness that cannot resume", () => {
		it("still offers restart, which relaunches the assist command", () => {
			const actions = sessionActionHandlers(
				session({
					commandType: "assist",
					harness: "codex",
					assistArgs: ["refine", "--harness", "codex", "a279"],
				}),
				handlers,
			);

			expect(actions.onRestart).toBeDefined();
		});
	});
});
