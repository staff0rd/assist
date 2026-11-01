import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../types";
import { transferStatus } from "./transferStatus";

function session(transfer: SessionInfo["transfer"]): SessionInfo {
	return {
		id: "7",
		name: "assist backlog run a1402",
		commandType: "assist",
		status: "running",
		startedAt: 0,
		transfer,
	};
}

describe("transferStatus", () => {
	it("shows a queued transfer as pending on the target", () => {
		expect(
			transferStatus(session({ target: "mac", queued: {} })),
		).toMatchObject({
			label: "Transfer to mac pending",
			queued: true,
			pending: false,
		});
	});

	it("shows an in-flight transfer as pending without queueing", () => {
		expect(transferStatus(session({ target: "mac" }))).toMatchObject({
			pending: true,
			queued: false,
		});
	});
});
