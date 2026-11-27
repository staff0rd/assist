import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestDaemonReply } from "../sessions/daemon/requestDaemonReply";
import { fetchSessionYolo } from "./fetchSessionYolo";

vi.unmock("./fetchSessionYolo");
vi.mock("../sessions/daemon/requestDaemonReply", () => ({
	requestDaemonReply: vi.fn(),
}));

const reply = vi.mocked(requestDaemonReply);

describe("fetchSessionYolo", () => {
	beforeEach(() => {
		vi.stubEnv("ASSIST_SESSION", "1");
		vi.stubEnv("ASSIST_SESSION_ID", "15");
		reply.mockReset();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("asks the daemon about this run's session", async () => {
		reply.mockResolvedValue({ yolo: true });
		expect(await fetchSessionYolo()).toBe(true);
		expect(reply).toHaveBeenCalledWith(
			{ type: "session-yolo", sessionId: "15" },
			"session-yolo",
		);
	});

	it("is not yolo when the daemon says so or does not answer", async () => {
		reply.mockResolvedValue({ yolo: false });
		expect(await fetchSessionYolo()).toBe(false);
		reply.mockResolvedValue(undefined);
		expect(await fetchSessionYolo()).toBe(false);
	});

	it("does not ask the daemon outside an assist session", async () => {
		vi.stubEnv("ASSIST_SESSION", "");
		expect(await fetchSessionYolo()).toBe(false);
		expect(reply).not.toHaveBeenCalled();
	});
});
