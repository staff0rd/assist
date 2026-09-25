import { describe, expect, it, vi } from "vitest";
import { handleCreated } from "./handleCreated";
import type { WsDispatch } from "../../../WsDispatch";

function dispatch(resolvedTitle?: string) {
	return {
		resolvePendingLaunch: vi.fn(() => resolvedTitle),
		setViewingTranscriptSessionId: vi.fn(),
		setActiveId: vi.fn(),
		setSuccess: vi.fn(),
	} as unknown as WsDispatch & {
		setSuccess: ReturnType<typeof vi.fn>;
		setActiveId: ReturnType<typeof vi.fn>;
	};
}

describe("handleCreated", () => {
	it("names the started launch in the toast", () => {
		const d = dispatch("a775 — Keep the backlog view put");

		handleCreated({ sessionId: "s1", isNew: true }, d);

		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "Started a775 — Keep the backlog view put",
			sessionId: "s1",
		});
	});

	it("falls back to the generic message when the launch has no title", () => {
		const d = dispatch();

		handleCreated({ sessionId: "s1", isNew: true }, d);

		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "New session started",
			sessionId: "s1",
		});
	});

	it("selects the session without a toast when resuming", () => {
		const d = dispatch("a775 — Keep the backlog view put");

		handleCreated({ sessionId: "s1" }, d);

		expect(d.setActiveId).toHaveBeenCalledWith("s1");
		expect(d.setSuccess).not.toHaveBeenCalled();
	});
});
