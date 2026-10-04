import { describe, expect, it } from "vitest";
import type { Activity } from "../../../../../../../shared/emitActivity";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { areChipsLoading } from "./areChipsLoading";
import type { SessionStatus } from "../../../types";

const reviewActivity: Activity = {
	kind: "command",
	name: "review",
	startedAt: 0,
};

describe("areChipsLoading", () => {
	it("should return true while the loading flag is set", () => {
		expect(
			areChipsLoading(makeSessionInfo({ commandType: "assist" }), true),
		).toBe(true);
	});

	it("should not spin for a running review session that has emitted activity", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			status: "running",
			activity: reviewActivity,
		});

		expect(areChipsLoading(session, false)).toBe(false);
	});

	it("should still spin for an assist session that has not yet emitted activity", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			status: "running",
			name: "next-backlog-item",
		});

		expect(areChipsLoading(session, false)).toBe(true);
	});

	it.each<SessionStatus>(["done", "error"])(
		"should not spin for a %s assist session even without activity",
		(status) => {
			const session = makeSessionInfo({ commandType: "assist", status });

			expect(areChipsLoading(session, false)).toBe(false);
		},
	);

	it("should not spin for a running console watcher, which never emits activity", () => {
		const session = makeSessionInfo({
			commandType: "assist",
			status: "running",
			watcher: true,
		});

		expect(areChipsLoading(session, false)).toBe(false);
	});

	it("should not spin for a non-assist session", () => {
		const session = makeSessionInfo({
			commandType: "claude",
			status: "running",
		});

		expect(areChipsLoading(session, false)).toBe(false);
	});
});
