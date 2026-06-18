import { describe, expect, it, vi } from "vitest";
import { ClientHub } from "./ClientHub";

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
});
