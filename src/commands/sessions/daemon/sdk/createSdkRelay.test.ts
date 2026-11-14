import { describe, expect, it, vi } from "vitest";
import type { SdkSessionEvent } from "../../../../shared/harnessAdapters/types";
import { makePty } from "../../../../test/mothers/makePty";
import { createSdkRelay } from "./createSdkRelay";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

function makeQuery() {
	const fake = makePty();
	const listeners: ((event: SdkSessionEvent) => void)[] = [];
	const sdk = {
		onEvent: (listener: (event: SdkSessionEvent) => void) =>
			listeners.push(listener),
		send: vi.fn(),
		interrupt: vi.fn(),
		dequeue: vi.fn(() => true),
		stopTask: vi.fn(),
	};
	return {
		query: { ...fake.pty, sdk },
		emit: (event: SdkSessionEvent) => {
			for (const listener of listeners) listener(event);
		},
		exit: fake.exit,
	};
}

function relayWithEvents() {
	const relay = createSdkRelay("session 1");
	const events: SdkSessionEvent[] = [];
	relay.handle.onEvent((event) => events.push(event));
	return { relay, events };
}

describe("createSdkRelay", () => {
	it("forwards messages, interrupts, dequeues and events to the attached query", () => {
		const { relay, events } = relayWithEvents();
		const { query, emit } = makeQuery();
		relay.handle.attach?.(query, false);
		relay.handle.send("hi");
		relay.handle.interrupt();
		expect(relay.handle.dequeue(0, "queued")).toBe(true);
		emit({ kind: "activity", text: "Working · Bash" });
		expect(query.sdk.send).toHaveBeenCalledWith("hi");
		expect(query.sdk.interrupt).toHaveBeenCalled();
		expect(query.sdk.dequeue).toHaveBeenCalledWith(0, "queued");
		expect(events).toEqual([{ kind: "activity", text: "Working · Bash" }]);
	});

	it("reports an idle launch as waiting", () => {
		const { relay, events } = relayWithEvents();
		relay.handle.attach?.(makeQuery().query, true);
		expect(events).toEqual([{ kind: "status", status: "waiting" }]);
	});

	it("clears the view state and stops relaying once the query ends", () => {
		const { relay, events } = relayWithEvents();
		const { query, emit, exit } = makeQuery();
		relay.handle.attach?.(query, false);
		exit(0);
		emit({ kind: "activity", text: "late" });
		relay.handle.send("after");
		expect(relay.handle.dequeue(0, "after")).toBe(false);
		expect(relay.current()).toBeUndefined();
		expect(query.sdk.send).not.toHaveBeenCalled();
		expect(events).toEqual([
			{ kind: "activity", text: null },
			{ kind: "elapsed", seconds: null },
			{ kind: "process", process: null },
			{ kind: "queued", texts: [] },
			{ kind: "pending", texts: [] },
			{ kind: "background", tasks: [] },
			{ kind: "interrupting", pending: false },
		]);
	});

	it("ignores events from a query replaced by the next launch", () => {
		const { relay, events } = relayWithEvents();
		const first = makeQuery();
		relay.handle.attach?.(first.query, false);
		relay.handle.attach?.(makeQuery().query, false);
		first.emit({ kind: "activity", text: "stale" });
		first.exit(0);
		expect(events).toEqual([]);
	});
});
