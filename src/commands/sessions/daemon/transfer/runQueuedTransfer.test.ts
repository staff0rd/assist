import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { SessionClient } from "../broadcast";
import type { TransferDeps } from "./TransferDeps";
import { cancelQueuedTransfer } from "./cancelQueuedTransfer";
import { runQueuedTransfer } from "./runQueuedTransfer";
import { transferSession } from "./transferSession";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./transferSession", () => ({
	transferSession: vi.fn(() => Promise.resolve()),
}));

const client: SessionClient = { send: vi.fn() };
const deps = {} as TransferDeps;

function queuedSession(status: "running" | "waiting" | "stopped") {
	return makeSession({
		id: "7",
		status,
		transfer: { target: "mac", queued: { cwd: "/Users/me/assist" } },
	});
}

describe("runQueuedTransfer", () => {
	beforeEach(() => vi.mocked(transferSession).mockClear());

	it("leaves the transfer queued while the agent is still mid-turn", () => {
		const s = queuedSession("running");
		expect(runQueuedTransfer(client, deps, s)).toBeUndefined();
		expect(transferSession).not.toHaveBeenCalled();
		expect(s.transfer?.queued).toBeDefined();
	});

	it.each(["waiting", "stopped"] as const)(
		"runs the queued transfer once the session is %s",
		async (status) => {
			const s = queuedSession(status);
			await runQueuedTransfer(client, deps, s);
			expect(s.transfer).toBeUndefined();
			expect(transferSession).toHaveBeenCalledWith(client, deps, {
				sessionId: "7",
				target: "mac",
				cwd: "/Users/me/assist",
			});
		},
	);

	it("does nothing when no transfer is queued", () => {
		const s = makeSession({ status: "waiting", transfer: { target: "mac" } });
		expect(runQueuedTransfer(client, deps, s)).toBeUndefined();
		expect(transferSession).not.toHaveBeenCalled();
	});

	it("does nothing after the pending transfer is cancelled", () => {
		const s = queuedSession("running");
		expect(cancelQueuedTransfer(s, "7")).toBe(true);
		expect(s.transfer).toBeUndefined();
		s.status = "waiting";
		expect(runQueuedTransfer(client, deps, s)).toBeUndefined();
		expect(transferSession).not.toHaveBeenCalled();
	});
});

describe("cancelQueuedTransfer", () => {
	it("keeps a failed transfer's error and reports no change", () => {
		const s = makeSession({ transfer: { target: "mac", error: "boom" } });
		expect(cancelQueuedTransfer(s, "7")).toBe(false);
		expect(s.transfer).toEqual({ target: "mac", error: "boom" });
	});
});
