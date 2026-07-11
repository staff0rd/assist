import { describe, expect, it, vi } from "vitest";
import { ClientHub } from "./ClientHub";
import { daemonLog } from "./daemonLog";

const rateLimits = {
	five_hour: { used_percentage: 12, resets_at: 100 },
	seven_day: { used_percentage: 34, resets_at: 200 },
};

describe("ClientHub", () => {
	it("broadcasts the latest limits to every connected client", () => {
		const hub = new ClientHub();
		const a = { send: vi.fn() };
		const b = { send: vi.fn() };
		hub.add(a);
		hub.add(b);

		hub.updateLimits(rateLimits);

		const expected = JSON.stringify({ type: "limits", rateLimits });
		expect(a.send).toHaveBeenCalledWith(expected);
		expect(b.send).toHaveBeenCalledWith(expected);
	});

	it("hands the limits to the injected persister after broadcasting", () => {
		const persist = vi.fn();
		const hub = new ClientHub(persist);
		const client = { send: vi.fn() };
		hub.add(client);

		hub.updateLimits(rateLimits);

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "limits", rateLimits }),
		);
		expect(persist).toHaveBeenCalledWith(rateLimits);
	});

	it("greets a client with the last-known limits", () => {
		const hub = new ClientHub();
		hub.updateLimits(rateLimits);
		const client = { send: vi.fn() };

		hub.greet(client);

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "limits", rateLimits }),
		);
	});

	it("greets with nothing before any limits are reported", () => {
		const hub = new ClientHub();
		const client = { send: vi.fn() };

		hub.greet(client);

		expect(client.send).not.toHaveBeenCalled();
	});

	it("exposes the active windows from the latest limits", () => {
		const hub = new ClientHub();
		expect(hub.currentWindows()).toEqual([]);

		hub.updateLimits(rateLimits);

		expect(hub.currentWindows()).toEqual([
			{ window: "five_hour", resetsAt: 100 },
			{ window: "seven_day", resetsAt: 200 },
		]);
	});

	describe("log subscription", () => {
		it("delivers live log lines only to subscribers", () => {
			const hub = new ClientHub();
			const subscriber = { send: vi.fn() };
			const plain = { send: vi.fn() };
			hub.add(subscriber);
			hub.add(plain);
			hub.subscribeLogs(subscriber);

			hub.emitLog("daemon line");

			expect(subscriber.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "log", line: "daemon line" }),
			);
			expect(plain.send).not.toHaveBeenCalled();
		});

		it("replays buffered history on subscribe by default", () => {
			daemonLog("buffered line");
			const hub = new ClientHub();
			const client = { send: vi.fn() };

			hub.subscribeLogs(client);

			expect(client.send).toHaveBeenCalledWith(
				expect.stringContaining("buffered line"),
			);
		});

		it("skips history replay when replay is false but still streams live", () => {
			daemonLog("earlier line");
			const hub = new ClientHub();
			const client = { send: vi.fn() };

			hub.subscribeLogs(client, false);

			expect(client.send).not.toHaveBeenCalled();

			hub.emitLog("live line");

			expect(client.send).toHaveBeenCalledWith(
				JSON.stringify({ type: "log", line: "live line" }),
			);
			expect(client.send).toHaveBeenCalledTimes(1);
		});

		it("stops delivering once unsubscribed", () => {
			const hub = new ClientHub();
			const client = { send: vi.fn() };
			hub.subscribeLogs(client);
			client.send.mockClear();

			hub.unsubscribeLogs(client);
			hub.emitLog("after");

			expect(client.send).not.toHaveBeenCalled();
		});
	});
});
