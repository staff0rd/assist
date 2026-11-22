import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRequestSession = vi.fn();

vi.mock("./requestSession", () => ({
	requestSession: (...args: unknown[]) => mockRequestSession(...args),
}));

import { requestAssistSession } from "./requestAssistSession";

beforeEach(() => {
	vi.clearAllMocks();
	mockRequestSession.mockResolvedValue("9");
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(() => {
	delete process.env.ASSIST_SESSION_ID;
});

describe("requestAssistSession", () => {
	it("launches from the chaining session so the new card nests under it", async () => {
		process.env.ASSIST_SESSION_ID = "7";

		await requestAssistSession(["review-pr-comments", "42"], "/git/repo", {
			inPlace: true,
		});

		expect(mockRequestSession).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["review-pr-comments", "42"],
			cwd: "/git/repo",
			inPlace: true,
			autopilotFrom: "7",
			launchedFrom: "7",
		});
	});

	it("prefers an explicitly named launcher over the ambient session", async () => {
		process.env.ASSIST_SESSION_ID = "7";

		await requestAssistSession(["review", "42"], "/git/repo", {
			launchedFrom: "3",
		});

		expect(mockRequestSession).toHaveBeenCalledWith(
			expect.objectContaining({ launchedFrom: "3" }),
		);
	});

	it("sends no launcher when it is not running inside a session", async () => {
		await requestAssistSession(["review", "42"], "/git/repo");

		expect(mockRequestSession).toHaveBeenCalledWith(
			expect.objectContaining({ launchedFrom: undefined }),
		);
		expect(mockRequestSession.mock.calls[0]?.[0]).not.toHaveProperty(
			"autopilotFrom",
		);
	});
});

describe("requestAssistSession on a named node", () => {
	it("targets the node and drops the launcher so the daemon forwards it", async () => {
		process.env.ASSIST_SESSION_ID = "7";

		await requestAssistSession(["backlog", "run", "a1"], "/win/repo", {
			node: "win",
		});

		expect(mockRequestSession).toHaveBeenCalledWith({
			type: "create-assist",
			assistArgs: ["backlog", "run", "a1"],
			cwd: "/win/repo",
			inPlace: false,
			autopilotFrom: "7",
			node: "win",
		});
	});
});

describe("requestAssistSession inheriting yolo", () => {
	it("names the requesting session so the daemon can pass on its yolo", async () => {
		process.env.ASSIST_SESSION_ID = "7";

		await requestAssistSession(["backlog", "run", "a1"], "/win/repo", {
			node: "win",
			inheritYolo: true,
		});

		expect(mockRequestSession).toHaveBeenCalledWith(
			expect.objectContaining({ node: "win", yoloFrom: "7" }),
		);
	});

	it("sends no yoloFrom unless asked to inherit", async () => {
		process.env.ASSIST_SESSION_ID = "7";

		await requestAssistSession(["review", "42"], "/git/repo");

		expect(mockRequestSession.mock.calls[0]?.[0]).not.toHaveProperty(
			"yoloFrom",
		);
	});
});
