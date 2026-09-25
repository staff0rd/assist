import { describe, expect, it } from "vitest";
import { displayStatus } from "./displayStatus";
import type { SessionInfo, SessionStatus } from "../../../types";

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "5",
		name: "assist draft --once something",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		...overrides,
	};
}

const preview = {
	requestId: "req-1",
	title: "Bug title",
	body: "body",
	prNumber: null,
	kind: "backlog-item" as const,
};

describe("displayStatus", () => {
	it("reads waiting while a preview sits unreviewed", () => {
		expect(displayStatus(session({ pendingPrPreview: preview }))).toBe(
			"waiting",
		);
	});

	it("returns to the real status once the preview is cleared", () => {
		expect(displayStatus(session())).toBe("running");
	});

	it("leaves a non-running status alone", () => {
		for (const status of [
			"waiting",
			"done",
			"error",
			"stopped",
		] satisfies SessionStatus[])
			expect(
				displayStatus(session({ status, pendingPrPreview: preview })),
			).toBe(status);
	});
});
