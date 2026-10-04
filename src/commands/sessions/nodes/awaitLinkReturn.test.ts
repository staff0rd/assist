import { describe, expect, it } from "vitest";
import type { LinkState } from "../daemon/links/LinkStatus";
import { awaitLinkReturn } from "./awaitLinkReturn";

function harness(states: LinkState[]) {
	let clock = 0;
	let index = 0;
	return {
		query: async () => {
			const state = states[Math.min(index++, states.length - 1)];
			return {
				type: "nodes" as const,
				local: "mac",
				links: [{ name: "win", url: "u", state, peerVersion: "1.2.3" }],
			};
		},
		sleep: async (ms: number) => {
			clock += ms;
		},
		now: () => clock,
	};
}

describe("awaitLinkReturn", () => {
	it("waits for the link to drop before reporting it back", async () => {
		const link = await awaitLinkReturn(
			"win",
			{ sawDown: false, timeoutMs: 10_000 },
			harness(["connected", "connected", "connecting", "connected"]),
		);
		expect(link?.state).toBe("connected");
		expect(link?.peerVersion).toBe("1.2.3");
	});

	it("returns straight away when the link was already down", async () => {
		const deps = harness(["connected"]);
		const link = await awaitLinkReturn(
			"win",
			{ sawDown: true, timeoutMs: 10_000 },
			deps,
		);
		expect(link?.state).toBe("connected");
		expect(deps.now()).toBe(0);
	});

	it("gives up when the link never comes back", async () => {
		const link = await awaitLinkReturn(
			"win",
			{ sawDown: false, timeoutMs: 5_000 },
			harness(["connected", "disconnected"]),
		);
		expect(link).toBeUndefined();
	});
});
