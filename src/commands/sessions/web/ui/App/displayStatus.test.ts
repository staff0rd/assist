import { describe, expect, it } from "vitest";
import { displayStatus } from "./displayStatus";
import type { SessionStatus } from "../types";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

const preview = {
	requestId: "req-1",
	title: "Bug title",
	body: "body",
	prNumber: null,
	kind: "backlog-item" as const,
};

describe("displayStatus", () => {
	it("reads waiting while a preview sits unreviewed", () => {
		expect(
			displayStatus(
				makeSessionInfo({ status: "running", pendingPrPreview: preview }),
			),
		).toBe("waiting");
	});

	it("returns to the real status once the preview is cleared", () => {
		expect(displayStatus(makeSessionInfo({ status: "running" }))).toBe(
			"running",
		);
	});

	it("leaves a non-running status alone", () => {
		for (const status of [
			"waiting",
			"done",
			"error",
			"stopped",
		] satisfies SessionStatus[])
			expect(
				displayStatus(makeSessionInfo({ status, pendingPrPreview: preview })),
			).toBe(status);
	});
});
