import { describe, expect, it } from "vitest";
import { senderSessionId } from "./senderSessionId";

describe("senderSessionId", () => {
	it("keeps a bare sender in a local transcript", () => {
		expect(senderSessionId("2", undefined, "wsl")).toBe("2");
	});

	it("keeps a node-qualified sender from another node", () => {
		expect(senderSessionId("mac:85", undefined, "wsl")).toBe("mac:85");
	});

	it("drops the node when the sender is on the viewer's node", () => {
		expect(senderSessionId("wsl:2", "win", "wsl")).toBe("2");
	});

	it("qualifies a bare sender in a linked node's transcript", () => {
		expect(senderSessionId("3", "win", "wsl")).toBe("win:3");
	});
});
