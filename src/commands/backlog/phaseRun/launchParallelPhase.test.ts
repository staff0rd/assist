import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";

const mockRequestSession = vi.fn();

vi.mock("../../sessions/shared/requestSession", () => ({
	requestSession: (...args: unknown[]) => mockRequestSession(...args),
}));
vi.mock("../../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));
vi.mock("../shared", () => ({ getReady: vi.fn(async () => ({ orm: {} })) }));
vi.mock("./setPhaseRunState", () => ({ setPhaseRunState: vi.fn() }));
vi.mock("./phaseGit", () => ({
	phaseGit: vi.fn(() => ({ out: "abc12345def" })),
}));

import { launchParallelPhase } from "./launchParallelPhase";

beforeEach(() => {
	vi.clearAllMocks();
	mockRequestSession.mockResolvedValue("10");
	process.env.ASSIST_SESSION_ID = "6";
});

afterEach(() => {
	delete process.env.ASSIST_SESSION_ID;
});

describe("launchParallelPhase", () => {
	it("asks the daemon to inherit yolo from the run session", async () => {
		await expect(
			launchParallelPhase(makeBacklogItem(), 4, "/tree"),
		).resolves.toBe(true);

		expect(mockRequestSession).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "create-assist",
				cwd: "/tree",
				startPoint: "abc12345def",
				yoloFrom: "6",
			}),
		);
		expect(mockRequestSession.mock.calls[0][0]).not.toHaveProperty("yolo");
	});
});
