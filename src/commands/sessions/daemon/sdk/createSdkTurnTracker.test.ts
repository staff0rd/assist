import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { createSdkSessionProcess } from "./createSdkSessionProcess";
import { createSdkTurnTracker } from "./createSdkTurnTracker";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function setup() {
	const control = createSdkSessionProcess("7", new AbortController());
	const events: SdkSessionEvent[] = [];
	control.process.sdk?.onEvent((event) => events.push(event));
	const push = vi.fn();
	const turn = createSdkTurnTracker("session 7", control, push);
	return { events, push, turn };
}

describe("createSdkTurnTracker", () => {
	beforeEach(() => vi.clearAllMocks());

	it("sends a message straight into the input when no turn is running", () => {
		const { events, push, turn } = setup();
		turn.send("hello");
		expect(push).toHaveBeenCalledWith("hello");
		expect(events).toEqual([
			{ kind: "pending", texts: ["hello"] },
			{ kind: "status", status: "running" },
		]);
	});

	it("does not mark a message queued mid-turn as pending", () => {
		const { events, turn } = setup();
		turn.start("first");
		turn.send("second");
		expect(events).not.toContainEqual(
			expect.objectContaining({ kind: "pending" }),
		);
	});

	it("clears pending messages when an interrupt is requested", () => {
		const { events, turn } = setup();
		turn.send("hello");
		turn.interrupt(vi.fn(() => Promise.resolve()));
		expect(events.slice(-2)).toEqual([
			{ kind: "interrupting", pending: true },
			{ kind: "pending", texts: [] },
		]);
	});

	it("queues messages sent mid-turn and sends them together when it ends", () => {
		const { events, push, turn } = setup();
		turn.start("first");
		turn.send("second");
		turn.send("third");
		expect(push).toHaveBeenCalledTimes(1);
		expect(events).toEqual([
			{ kind: "queued", texts: ["second"] },
			{ kind: "queued", texts: ["second", "third"] },
		]);
		turn.setStatus("waiting");
		expect(push).toHaveBeenLastCalledWith("second\n\nthird");
		expect(events.at(-1)).toEqual({
			kind: "queued",
			texts: [],
			sent: "second\n\nthird",
		});
		expect(events).not.toContainEqual({ kind: "status", status: "waiting" });
	});

	it("marks the interrupt pending until the turn ends", async () => {
		const { events, turn } = setup();
		turn.start("first");
		const request = vi.fn(() => Promise.resolve());
		turn.interrupt(request);
		turn.interrupt(request);
		expect(request).toHaveBeenCalledTimes(1);
		expect(events).toEqual([
			{ kind: "interrupting", pending: true },
			{ kind: "pending", texts: [] },
		]);
		turn.setStatus("waiting");
		expect(events).toContainEqual({ kind: "interrupting", pending: false });
	});

	it("ignores an interrupt when no turn is running", () => {
		const { events, turn } = setup();
		const request = vi.fn(() => Promise.resolve());
		turn.interrupt(request);
		expect(request).not.toHaveBeenCalled();
		expect(events).toEqual([]);
	});

	it("clears the pending interrupt when the request fails", async () => {
		const { events, turn } = setup();
		turn.start("first");
		turn.interrupt(() => Promise.reject(new Error("gone")));
		await vi.waitFor(() =>
			expect(events.at(-1)).toEqual({ kind: "interrupting", pending: false }),
		);
	});
});
