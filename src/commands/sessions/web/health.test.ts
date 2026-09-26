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
	});

	it("reports the node name, version, protocol and daemon reachability", async () => {
		expect(await run()).toEqual({
			nodeName: "pc-windows",
			version: ASSIST_VERSION,
			protocol: PROTOCOL_VERSION,
			daemon: { reachable: true },
		});
	});

	it("reports an unreachable daemon", async () => {
		mockIsDaemonRunning.mockResolvedValue(false);
		expect(await run()).toMatchObject({ daemon: { reachable: false } });
	});

	it("falls back to the hostname-derived name when unset", async () => {
		mockLoadConfig.mockReturnValue({});
		const body = await run();
		expect(typeof body.nodeName).toBe("string");
		expect(body.nodeName).not.toBe("");
	});
});
