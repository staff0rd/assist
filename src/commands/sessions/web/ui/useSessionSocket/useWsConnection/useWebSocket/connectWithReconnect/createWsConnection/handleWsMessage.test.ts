import { describe, expect, it, vi } from "vitest";
import { handleWsMessage } from "./handleWsMessage";
import type { WsDispatch } from "../../WsDispatch";

type Mocked = WsDispatch & {
	setSuccess: ReturnType<typeof vi.fn>;
	setError: ReturnType<typeof vi.fn>;
	handoffTransfer: ReturnType<typeof vi.fn>;
};

function dispatch(): Mocked {
	return {
		setSuccess: vi.fn(),
		setError: vi.fn(),
		handoffTransfer: vi.fn(),
		failPendingLaunch: vi.fn(),
	} as unknown as Mocked;
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
		expect(d.handoffTransfer).not.toHaveBeenCalled();
	});

	it("hands a transfer's selection to the new session", () => {
		const d = dispatch();

		handleWsMessage(
			{
				type: "notice",
				message: "Transferred to mac",
				transfer: { sourceId: "7", sessionId: "mac:3", node: "mac" },
			},
			d,
		);

		expect(d.handoffTransfer).toHaveBeenCalledWith("7", "mac:3");
		expect(d.setSuccess).toHaveBeenCalledWith({
			message: "Transferred to mac",
			sessionId: "mac:3",
		});
	});

	it("keeps errors on the error channel", () => {
		const d = dispatch();

		handleWsMessage({ type: "error", message: "boom" }, d);

		expect(d.setError).toHaveBeenCalledWith("boom");
		expect(d.setSuccess).not.toHaveBeenCalled();
	});
});
