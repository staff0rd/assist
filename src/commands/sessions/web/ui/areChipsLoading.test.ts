import { describe, expect, it } from "vitest";
import type { Activity } from "../../../../shared/emitActivity";
import { areChipsLoading } from "./areChipsLoading";
import type { SessionInfo, SessionStatus } from "./types";

function makeSession(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "1",
		name: "review",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

const reviewActivity: Activity = {
	kind: "command",
	name: "review",
	startedAt: 0,
};

describe("areChipsLoading", () => {
	it("should return true while the loading flag is set", () => {
		expect(areChipsLoading(makeSession(), true)).toBe(true);
	});

	it("should not spin for a running review session that has emitted activity", () => {
		const session = makeSession({ activity: reviewActivity });

		expect(areChipsLoading(session, false)).toBe(false);
	});

	it("should still spin for an assist session that has not yet emitted activity", () => {
		const session = makeSession({ name: "next-backlog-item" });

		expect(areChipsLoading(session, false)).toBe(true);
	});

	it.each<SessionStatus>(["done", "error"])(
		"should not spin for a %s assist session even without activity",
		(status) => {
			const session = makeSession({ status, activity: undefined });

			expect(areChipsLoading(session, false)).toBe(false);
		},
	);

	it("should not spin for a non-assist session", () => {
		const session = makeSession({ commandType: "claude", activity: undefined });

		expect(areChipsLoading(session, false)).toBe(false);
	});
});
