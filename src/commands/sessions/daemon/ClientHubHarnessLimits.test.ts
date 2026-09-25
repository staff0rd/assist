import { describe, expect, it, vi } from "vitest";
import { ClientHub } from "./ClientHub";

const claudeLimits = { five_hour: { used_percentage: 12, resets_at: 100 } };
const codexLimits = { seven_day: { used_percentage: 3, resets_at: 900 } };

describe("ClientHub harness limits", () => {
	it("broadcasts and persists another harness's limits under its own key", () => {
		const persist = vi.fn();
		const hub = new ClientHub(persist);
		const client = { send: vi.fn() };
		hub.add(client);

		hub.updateHarnessLimits("codex", codexLimits);

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({
				type: "limits",
				harness: "codex",
				rateLimits: codexLimits,
			}),
		);
		expect(persist).toHaveBeenCalledWith(codexLimits, "codex");
	});

	it("keeps Claude's and Codex's active windows apart", () => {
		const hub = new ClientHub();
		hub.updateLimits(claudeLimits);
		hub.updateHarnessLimits("codex", codexLimits);

		expect(hub.currentWindows()).toEqual([
			{ window: "five_hour", resetsAt: 100 },
		]);
		expect(hub.currentWindows("codex")).toEqual([
			{ window: "codex:seven_day", resetsAt: 900 },
		]);
	});

	it("routes a claude harness update through the unchanged Claude path", () => {
		const persist = vi.fn();
		const hub = new ClientHub(persist);
		const client = { send: vi.fn() };
		hub.add(client);

		hub.updateHarnessLimits("claude", claudeLimits);

		expect(client.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "limits", rateLimits: claudeLimits }),
		);
		expect(persist).toHaveBeenCalledWith(claudeLimits);
	});

	it("greets with Claude's limits then each harness's", () => {
		const hub = new ClientHub();
		hub.updateLimits(claudeLimits);
		hub.updateHarnessLimits("codex", codexLimits);
		const client = { send: vi.fn() };

		hub.greet(client);

		expect(client.send.mock.calls.map(([m]) => JSON.parse(m))).toEqual([
			{ type: "limits", rateLimits: claudeLimits },
			{ type: "limits", harness: "codex", rateLimits: codexLimits },
		]);
	});
});
