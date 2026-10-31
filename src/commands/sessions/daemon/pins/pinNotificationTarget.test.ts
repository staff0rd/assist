import { describe, expect, it } from "vitest";
import type { SessionClient } from "../broadcast";
import { pinNotificationTarget } from "./pinNotificationTarget";

const peer: SessionClient = { send: () => {} };
const peerFor = (node: string) => (node === "mac" ? peer : undefined);

describe("pinNotificationTarget", () => {
	it("targets the viewer's node when it has a peer link here", () => {
		expect(pinNotificationTarget("mac", "work-wsl", peerFor)).toEqual({
			kind: "peer",
			node: "mac",
			peer,
		});
	});

	it.each([
		["no active viewer", undefined],
		["the session's own node", "work-wsl"],
		["a viewer node with no peer link", "laptop"],
	])("stays local for %s", (_label, viewerNode) => {
		expect(pinNotificationTarget(viewerNode, "work-wsl", peerFor).kind).toBe(
			"local",
		);
	});
});
