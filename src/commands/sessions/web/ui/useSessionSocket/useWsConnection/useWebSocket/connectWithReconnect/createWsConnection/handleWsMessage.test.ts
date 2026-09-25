import { describe, expect, it, vi } from "vitest";
import { handleWsMessage } from "./handleWsMessage";
import type { WsDispatch } from "../../WsDispatch";

function dispatch(): WsDispatch & {
	setSuccess: ReturnType<typeof vi.fn>;
	setError: ReturnType<typeof vi.fn>;
} {
	return {
		setSuccess: vi.fn(),
		setError: vi.fn(),
		failPendingLaunch: vi.fn(),
	} as unknown as WsDispatch & {
		setSuccess: ReturnType<typeof vi.fn>;
		setError: ReturnType<typeof vi.fn>;
	};
}

describe("handleWsMessage notice", () => {
	it("surfaces a daemon notice as a success snackbar", () => {
		const d = dispatch();

		handleWsMessage(
			{ type: "notice", message: "Windows host is up to date" },
			d,
		);

		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "Windows host is up to date",
			sessionId: null,
		});
		expect(d.setError).not.toHaveBeenCalled();
	});

	it("keeps errors on the error channel", () => {
		const d = dispatch();

		handleWsMessage({ type: "error", message: "boom" }, d);

		expect(d.setError).toHaveBeenCalledWith("boom");
		expect(d.setSuccess).not.toHaveBeenCalled();
	});
});
