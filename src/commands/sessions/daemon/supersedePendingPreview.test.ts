import { describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { PrPreviewCoordinator } from "./PrPreviewCoordinator";

function makeClient(): SessionClient & { sent: Record<string, unknown>[] } {
	const sent: Record<string, unknown>[] = [];
	return { sent, send: (data: string) => sent.push(JSON.parse(data)) };
}

function sdkSession(stopTask: (taskId: string) => Promise<void>): Session {
	const pty = {
		sdk: { onEvent: vi.fn(), send: vi.fn(), interrupt: vi.fn(), stopTask },
	} as unknown as SessionProcess;
	return makeSession({ id: "1", pty });
}

function ask(requestId: string, taskId?: string) {
	return {
		type: "pr-preview",
		sessionId: "1",
		requestId,
		title: "Question",
		body: "{}",
		prNumber: null,
		kind: "ask",
		taskId,
	};
}

describe("supersedePendingPreview", () => {
	it("stops the superseded SDK task instead of letting it exit", async () => {
		const stopTask = vi.fn().mockResolvedValue(undefined);
		const coord = new PrPreviewCoordinator(
			new Map([["1", sdkSession(stopTask)]]),
			vi.fn(),
		);
		const oldWaiter = makeClient();
		coord.set(oldWaiter, ask("r1", "bold00001"));

		coord.set(makeClient(), ask("r2", "bnew00002"));
		await vi.waitFor(() => expect(stopTask).toHaveBeenCalled());

		expect(stopTask).toHaveBeenCalledWith("bold00001");
		expect(oldWaiter.sent).toEqual([]);
	});

	it("tells the waiter it was superseded when the stop fails", async () => {
		const stopTask = vi.fn().mockRejectedValue(new Error("No task found"));
		const coord = new PrPreviewCoordinator(
			new Map([["1", sdkSession(stopTask)]]),
			vi.fn(),
		);
		const oldWaiter = makeClient();
		coord.set(oldWaiter, ask("r1", "bold00001"));

		coord.set(makeClient(), ask("r2"));

		await vi.waitFor(() =>
			expect(oldWaiter.sent).toEqual([
				{ type: "pr-superseded", requestId: "r1", supersededBy: "r2" },
			]),
		);
	});

	it("tells the waiter it was superseded when it is not a known task", () => {
		const stopTask = vi.fn();
		const coord = new PrPreviewCoordinator(
			new Map([["1", sdkSession(stopTask)]]),
			vi.fn(),
		);
		const oldWaiter = makeClient();
		coord.set(oldWaiter, ask("r1"));

		coord.set(makeClient(), ask("r2", "bnew00002"));

		expect(stopTask).not.toHaveBeenCalled();
		expect(oldWaiter.sent).toEqual([
			{ type: "pr-superseded", requestId: "r1", supersededBy: "r2" },
		]);
	});
});
