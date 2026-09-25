import { describe, expect, it } from "vitest";
import { isVerifying } from "./isVerifying";
import type { SessionInfo } from "../types";

const session: SessionInfo = {
	id: "1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
};

describe("isVerifying", () => {
	it("is true for a running session flagged by the daemon", () => {
		expect(isVerifying({ ...session, verifying: true })).toBe(true);
	});

	it("is false without the daemon flag", () => {
		expect(isVerifying(session)).toBe(false);
	});

	it("is false once the session has left running", () => {
		expect(isVerifying({ ...session, verifying: true, status: "done" })).toBe(
			false,
		);
	});

	it("yields to a pending pr preview, which displays as waiting", () => {
		const preview = {
			requestId: "r1",
			title: "t",
			body: "b",
			prNumber: null,
		};
		expect(
			isVerifying({ ...session, verifying: true, pendingPrPreview: preview }),
		).toBe(false);
	});
});
