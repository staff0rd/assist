import { afterEach, describe, expect, it, vi } from "vitest";
import { relayRateLimits } from "./relayRateLimits";
import { sendToDaemon } from "./sessions/daemon/sendToDaemon";

vi.mock("./sessions/daemon/sendToDaemon", () => ({ sendToDaemon: vi.fn() }));

const sendMock = vi.mocked(sendToDaemon);

const rateLimits = {
	five_hour: { used_percentage: 12, resets_at: 100 },
	seven_day: { used_percentage: 34, resets_at: 200 },
};

describe("relayRateLimits", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("sends a limits message to the daemon with a short timeout", async () => {
		sendMock.mockResolvedValue(undefined);

		await relayRateLimits(rateLimits);

		expect(sendMock).toHaveBeenCalledWith(
			{ type: "limits", rateLimits },
			1_000,
		);
	});

	it("swallows errors when the daemon is not running", async () => {
		sendMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await expect(relayRateLimits(rateLimits)).resolves.toBeUndefined();
	});

	it("does nothing when there are no limits to relay", async () => {
		await relayRateLimits(undefined);

		expect(sendMock).not.toHaveBeenCalled();
	});
});
