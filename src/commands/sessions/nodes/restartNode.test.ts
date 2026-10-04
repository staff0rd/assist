import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLinkStatus = vi.fn();
const mockPostToPeer = vi.fn();
const mockFindLinkSpec = vi.fn();
const mockAwaitLinkReturn = vi.fn();
const mockFirstBrokenHop = vi.fn();
const mockAppendDaemonLog = vi.fn();

vi.mock("./awaitLinkReturn", () => ({
	linkStatus: (name: string) => mockLinkStatus(name),
	awaitLinkReturn: (...args: unknown[]) => mockAwaitLinkReturn(...args),
}));
vi.mock("./postToPeer", () => ({
	postToPeer: (...args: unknown[]) => mockPostToPeer(...args),
}));
vi.mock("../shared/loadLinkSpecs", () => ({
	findLinkSpec: (name: string) => mockFindLinkSpec(name),
}));
vi.mock("./firstBrokenHop", () => ({
	firstBrokenHop: (name: string) => mockFirstBrokenHop(name),
}));
vi.mock("../daemon/appendDaemonLog", () => ({
	appendDaemonLog: (line: string) => mockAppendDaemonLog(line),
}));

import { restartNode } from "./restartNode";

let logs: string[];

beforeEach(() => {
	vi.clearAllMocks();
	mockPostToPeer.mockReset();
	logs = [];
	vi.spyOn(console, "log").mockImplementation((line: string) => {
		logs.push(line);
	});
	mockFindLinkSpec.mockReturnValue({ name: "win", url: "http://win:3100" });
	mockLinkStatus.mockResolvedValue({ state: "connected" });
});

describe("restartNode", () => {
	it("restarts the peer, waits for the link to drop and return, and prints its version", async () => {
		mockAwaitLinkReturn.mockResolvedValue({
			state: "connected",
			peerVersion: "1.2.3",
		});

		await restartNode("win", { target: "both" });

		const trace = /trace=(\w+)/.exec(logs[0])?.[1];
		expect(logs[0]).toBe(`nodes restart both win trace=${trace}`);
		expect(mockAppendDaemonLog).toHaveBeenCalledWith(logs[0]);
		expect(mockPostToPeer).toHaveBeenCalledWith(
			"http://win:3100",
			"/api/restart?target=both",
			trace,
			expect.any(Number),
		);
		expect(mockAwaitLinkReturn).toHaveBeenCalledWith("win", {
			sawDown: false,
			timeoutMs: 90_000,
		});
		expect(logs.at(-1)).toBe("win is back (v1.2.3)");
	});

	it("rejects an unknown target", async () => {
		await expect(restartNode("win", { target: "all" })).rejects.toThrow(
			"--target must be one of daemon, webserver, both",
		);
		expect(mockPostToPeer).not.toHaveBeenCalled();
	});

	it("names the first broken doctor hop when the web server is unreachable", async () => {
		mockPostToPeer.mockRejectedValue(new Error("fetch failed"));
		mockFirstBrokenHop.mockResolvedValue({
			hop: "web",
			ok: false,
			error: "ECONNREFUSED",
			remediation: "start the web server",
		});

		await expect(restartNode("win", { target: "daemon" })).rejects.toThrow(
			"Restart win failed (fetch failed): web hop failed: ECONNREFUSED — start the web server",
		);
	});

	it("names the doctor hop when the link does not come back", async () => {
		mockAwaitLinkReturn.mockResolvedValue(undefined);
		mockFirstBrokenHop.mockResolvedValue(undefined);

		await expect(restartNode("win", { target: "both" })).rejects.toThrow(
			"win did not come back",
		);
	});
});
