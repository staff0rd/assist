import type { ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfig = vi.fn();
const mockRespondJson = vi.fn();
const mockIsDaemonRunning = vi.fn();

vi.mock("../../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../daemon/connectToDaemon", () => ({
	isDaemonRunning: () => mockIsDaemonRunning(),
}));

const mockQueryNodes = vi.fn();
vi.mock("../nodes/queryNodes", () => ({
	queryNodes: () => mockQueryNodes(),
}));

const WINDOWS_LINK = {
	name: "pc-windows",
	url: "http://127.0.0.1:3101",
	state: "connected",
};

import { ASSIST_VERSION, PROTOCOL_VERSION } from "../daemon/buildHello";
import { health } from "./health";

async function run(): Promise<Record<string, unknown>> {
	await health({} as never, {} as ServerResponse);
	return mockRespondJson.mock.lastCall?.[2];
}

describe("health", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLoadConfig.mockReturnValue({ sessions: { nodeName: "pc-windows" } });
		mockIsDaemonRunning.mockResolvedValue(true);
		mockQueryNodes.mockResolvedValue({
			type: "nodes",
			local: "pc-wsl",
			links: [WINDOWS_LINK],
		});
	});

	it("reports the node name, version, protocol, daemon reachability and links", async () => {
		expect(await run()).toEqual({
			nodeName: "pc-windows",
			version: ASSIST_VERSION,
			protocol: PROTOCOL_VERSION,
			daemon: { reachable: true },
			links: [WINDOWS_LINK],
		});
	});

	it("reports an unreachable daemon with no links", async () => {
		mockIsDaemonRunning.mockResolvedValue(false);
		mockQueryNodes.mockResolvedValue(undefined);
		expect(await run()).toMatchObject({
			daemon: { reachable: false },
			links: [],
		});
	});

	it("falls back to the hostname-derived name when unset", async () => {
		mockLoadConfig.mockReturnValue({});
		const body = await run();
		expect(typeof body.nodeName).toBe("string");
		expect(body.nodeName).not.toBe("");
	});
});
