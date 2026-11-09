import { describe, expect, it, vi } from "vitest";
import { ClientHub } from "./ClientHub";

const peerLimits = { five_hour: { used_percentage: 40, resets_at: 100 } };
const localLimits = { five_hour: { used_percentage: 55, resets_at: 100 } };

function setup() {
	const persist = vi.fn();
	const hub = new ClientHub(persist);
	const viewer = { send: vi.fn() };
	const peer = { send: vi.fn() };
	hub.add(viewer);
	hub.add(peer);
	hub.markPeer(peer, "pc-windows");
	return { persist, hub, viewer, peer };
}

describe("ClientHub peer limits", () => {
	it("broadcasts relayed limits to viewers only, without persisting", () => {
		const { persist, hub, viewer, peer } = setup();

		hub.relayPeerLimits(undefined, peerLimits);

		expect(viewer.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "limits", rateLimits: peerLimits }),
		);
		expect(peer.send).not.toHaveBeenCalled();
		expect(persist).not.toHaveBeenCalled();
	});

	it("greets a later client with the relayed limits", () => {
		const { hub } = setup();
		hub.relayPeerLimits("codex", peerLimits);
		const late = { send: vi.fn() };

		hub.greet(late);

		expect(late.send).toHaveBeenCalledWith(
			JSON.stringify({
				type: "limits",
				harness: "codex",
				rateLimits: peerLimits,
			}),
		);
	});

	it("lets a later local reading replace a relayed one", () => {
		const { hub } = setup();
		hub.relayPeerLimits(undefined, peerLimits);
		hub.updateLimits(localLimits);
		const late = { send: vi.fn() };

		hub.greet(late);

		expect(late.send).toHaveBeenCalledTimes(1);
		expect(late.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "limits", rateLimits: localLimits }),
		);
	});
});
