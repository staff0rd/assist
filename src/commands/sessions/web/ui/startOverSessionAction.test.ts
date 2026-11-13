import { expect, it, vi } from "vitest";
import { startOverSessionAction } from "./startOverSessionAction";

it("clears the cached output and sends start-over", () => {
	const send = vi.fn();
	const buffers = new Map([["7", "old output"]]);
	startOverSessionAction(send, buffers)("7");
	expect(send).toHaveBeenCalledWith({ type: "start-over", sessionId: "7" });
	expect(buffers.has("7")).toBe(false);
});
