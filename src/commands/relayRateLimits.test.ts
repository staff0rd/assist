import { afterEach, describe, expect, it, vi } from "vitest";
import { relayRateLimits } from "./relayRateLimits";
import { connectToDaemon } from "./sessions/daemon/connectToDaemon";

vi.mock("./sessions/daemon/connectToDaemon", () => ({
	connectToDaemon: vi.fn(),
}));

const connectMock = connectToDaemon as unknown as ReturnType<typeof vi.fn>;

const rateLimits = {
	five_hour: { used_percentage: 12, resets_at: 100 },
	seven_day: { used_percentage: 34, resets_at: 200 },
};

describe("relayRateLimits", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("writes a newline-delimited limits message to the daemon", async () => {
		const write = vi.fn((_data: string, cb: () => void) => cb());
		const socket = { write, on: vi.fn(), end: vi.fn(), destroy: vi.fn() };
		connectMock.mockResolvedValue(socket);

		await relayRateLimits(rateLimits);

		expect(write).toHaveBeenCalledWith(
			`${JSON.stringify({ type: "limits", rateLimits })}\n`,
			expect.any(Function),
		);
		expect(socket.end).toHaveBeenCalledOnce();
	});

	it("swallows errors when the daemon is not running", async () => {
		connectMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await expect(relayRateLimits(rateLimits)).resolves.toBeUndefined();
	});

	it("does nothing when there are no limits to relay", async () => {
		await relayRateLimits(undefined);

		expect(connectMock).not.toHaveBeenCalled();
	});
});
