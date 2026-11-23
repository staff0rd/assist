import { describe, expect, it, vi } from "vitest";
import type { Session } from "../types";
import { closeIdleAutopilotRoots } from "./closeIdleAutopilotRoots";

vi.mock("../daemonLog", () => ({ daemonLog: () => {} }));

const session = (id: string, fields: Partial<Session>) =>
	({ id, autopilot: "root", status: "waiting", ...fields }) as Session;

describe("closeIdleAutopilotRoots", () => {
	it("closes the scheduled session once its turn ends idle", () => {
		const dismiss = vi.fn();
		closeIdleAutopilotRoots([session("root", {})], dismiss);
		expect(dismiss).toHaveBeenCalledWith("root");
	});

	it("keeps a session that is working, waiting on a preview or errored", () => {
		const dismiss = vi.fn();
		closeIdleAutopilotRoots(
			[
				session("root", { status: "running" }),
				session("root", {
					pendingPrPreview: { requestId: "r" } as Session["pendingPrPreview"],
				}),
				session("root", { status: "error" }),
			],
			dismiss,
		);
		expect(dismiss).not.toHaveBeenCalled();
	});

	it("leaves the backlog runs it started to dismiss themselves", () => {
		const dismiss = vi.fn();
		closeIdleAutopilotRoots([session("run", {})], dismiss);
		expect(dismiss).not.toHaveBeenCalled();
	});
});
