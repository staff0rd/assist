import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLinkStatus = vi.fn();
const mockPostToPeer = vi.fn();
const mockRequestSession = vi.fn();
const mockAwaitReturn = vi.fn();
const mockFail = vi.fn(async (summary: string) => new Error(summary));

vi.mock("./awaitLinkReturn", () => ({
	linkStatus: (name: string) => mockLinkStatus(name),
}));
vi.mock("./postToPeer", () => ({
	postToPeer: (...args: unknown[]) => mockPostToPeer(...args),
}));
vi.mock("../shared/requestSession", () => ({
	requestSession: (msg: unknown) => mockRequestSession(msg),
}));
vi.mock("./startPeerAction", () => ({
	startPeerAction: () => ({
		spec: { name: "win", url: "http://win:3100" },
		traceId: "abc12345",
		fail: mockFail,
		awaitReturn: mockAwaitReturn,
	}),
}));

import { updateNode } from "./updateNode";

let logs: string[];

beforeEach(() => {
	vi.clearAllMocks();
	mockPostToPeer.mockReset();
	logs = [];
	vi.spyOn(console, "log").mockImplementation((line: string) => {
		logs.push(line);
	});
	mockAwaitReturn.mockResolvedValue({
		state: "connected",
		peerVersion: "2.0.0",
	});
});

describe("updateNode", () => {
	it("opens an update card over a connected link, then restarts the web server", async () => {
		mockLinkStatus.mockResolvedValue({ state: "connected" });
		mockRequestSession.mockResolvedValue("win:7");

		await updateNode("win");

		expect(mockRequestSession).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["update"],
			node: "win",
		});
		expect(mockPostToPeer).toHaveBeenCalledWith(
			"http://win:3100",
			"/api/restart?target=webserver",
			"abc12345",
			expect.any(Number),
		);
		expect(mockAwaitReturn).toHaveBeenCalledTimes(2);
		expect(logs).toContain("win updated to v2.0.0");
	});

	it("falls back to self-update when the link is version-blocked", async () => {
		mockLinkStatus.mockResolvedValue({ state: "version-blocked" });

		await updateNode("win");

		expect(mockRequestSession).not.toHaveBeenCalled();
		expect(mockPostToPeer).toHaveBeenCalledWith(
			"http://win:3100",
			"/api/self-update",
			"abc12345",
			expect.any(Number),
		);
		expect(mockAwaitReturn).toHaveBeenCalledWith(true);
		expect(logs).toContain("win updated to v2.0.0");
	});

	it("reports the failure through the doctor hop when the peer is unreachable", async () => {
		mockLinkStatus.mockResolvedValue({ state: "disconnected" });
		mockPostToPeer.mockRejectedValue(new Error("fetch failed"));

		await expect(updateNode("win")).rejects.toThrow("Update win failed");
		expect(mockFail).toHaveBeenCalledWith(
			"Update win failed",
			expect.any(Error),
		);
	});
});
