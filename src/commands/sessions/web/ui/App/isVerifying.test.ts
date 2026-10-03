import { describe, expect, it } from "vitest";
import { isVerifying } from "./isVerifying";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";

describe("isVerifying", () => {
	it("is true for a running session flagged by the daemon", () => {
		expect(
			isVerifying(makeSessionInfo({ status: "running", verifying: true })),
		).toBe(true);
	});

	it("is false without the daemon flag", () => {
		expect(isVerifying(makeSessionInfo({ status: "running" }))).toBe(false);
	});

	it("is false once the session has left running", () => {
		expect(
			isVerifying(makeSessionInfo({ verifying: true, status: "done" })),
		).toBe(false);
	});

	it("yields to a pending pr preview, which displays as waiting", () => {
		const preview = {
			requestId: "r1",
			title: "t",
			body: "b",
			prNumber: null,
		};
		expect(
			isVerifying(
				makeSessionInfo({
					status: "running",
					verifying: true,
					pendingPrPreview: preview,
				}),
			),
		).toBe(false);
	});
});
