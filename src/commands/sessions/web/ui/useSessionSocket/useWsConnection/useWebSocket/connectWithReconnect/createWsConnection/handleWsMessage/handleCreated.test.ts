import { describe, expect, it, vi } from "vitest";
import { handleCreated } from "./handleCreated";
import type { WsDispatch } from "../../../WsDispatch";

function dispatch(
	resolvedTitle?: string,
	activeId: string | null = null,
	open = false,
) {
	return {
		resolvePendingLaunch: vi.fn(() => ({ title: resolvedTitle, open })),
		getActiveId: vi.fn(() => activeId),
		setViewingTranscriptSessionId: vi.fn(),
		setActiveId: vi.fn(),
		setSuccess: vi.fn(),
	} as unknown as WsDispatch & {
		resolvePendingLaunch: ReturnType<typeof vi.fn>;
		setViewingTranscriptSessionId: ReturnType<typeof vi.fn>;
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

	it("keeps the focused session when a new spawn completes", () => {
		const d = dispatch("a775 — Keep the backlog view put", "s0");

		handleCreated({ sessionId: "s1", isNew: true }, d);

		expect(d.setActiveId).not.toHaveBeenCalled();
		expect(d.setViewingTranscriptSessionId).not.toHaveBeenCalled();
		expect(d.resolvePendingLaunch).toHaveBeenCalled();
		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "Started a775 — Keep the backlog view put",
			sessionId: "s1",
		});
	});

	it("focuses a new spawn launched with open even when another is focused", () => {
		const d = dispatch(undefined, "s0", true);

		handleCreated({ sessionId: "s1", isNew: true }, d);

		expect(d.setActiveId).toHaveBeenCalledWith("s1");
		expect(d.setViewingTranscriptSessionId).toHaveBeenCalledWith(null);
		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "New session started",
			sessionId: "s1",
		});
	});

	it("focuses a new spawn when no session is focused", () => {
		const d = dispatch();

		handleCreated({ sessionId: "s1", isNew: true }, d);

		expect(d.setActiveId).toHaveBeenCalledWith("s1");
		expect(d.setViewingTranscriptSessionId).toHaveBeenCalledWith(null);
	});

	it("focuses the resumed session without a toast even when another is focused", () => {
		const d = dispatch("a775 — Keep the backlog view put", "s0");

		handleCreated({ sessionId: "s1" }, d);

		expect(d.setActiveId).toHaveBeenCalledWith("s1");
		expect(d.setViewingTranscriptSessionId).toHaveBeenCalledWith(null);
		expect(d.setSuccess).not.toHaveBeenCalled();
	});
});
