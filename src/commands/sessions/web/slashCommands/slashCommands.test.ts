import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();
const mockRead = vi.fn();
const mockStartPoint = vi.fn();

vi.mock("../../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../../shared/harnesses", () => ({
	harnesses: { claude: { homeDir: "/home/me/.claude" } },
}));

vi.mock("./listSlashCommands", () => ({
	listSlashCommands: (...args: unknown[]) => mockRead(...args),
}));

vi.mock("./startPointProjectCommands", () => ({
	startPointProjectCommands: (...args: unknown[]) => mockStartPoint(...args),
}));

import { slashCommands } from "./slashCommands";

async function request(query: string) {
	await slashCommands(
		{ url: `/api/slash-commands?${query}` } as IncomingMessage,
		{} as ServerResponse,
	);
	return mockRespondJson.mock.lastCall?.slice(1);
}

describe("slashCommands", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRead.mockReturnValue([{ name: "draft", scope: "user" }]);
	});

	it("lists the Claude home's and the cwd's skills and commands", async () => {
		expect(await request("cwd=/repo")).toEqual([
			200,
			{ commands: [{ name: "draft", scope: "user" }] },
		]);
		expect(mockRead).toHaveBeenCalledWith("/home/me/.claude", "/repo", null);
		expect(mockStartPoint).not.toHaveBeenCalled();
	});

	it("lists project commands from the worktree start point when asked", async () => {
		const project = [{ name: "helm", scope: "project" }];
		mockStartPoint.mockResolvedValue(project);
		await request("cwd=/repo&startPoint=1");
		expect(mockStartPoint).toHaveBeenCalledWith("/repo");
		expect(mockRead).toHaveBeenCalledWith("/home/me/.claude", "/repo", project);
	});

	it("falls back to the working tree when the start point does not resolve", async () => {
		mockStartPoint.mockResolvedValue(null);
		await request("cwd=/repo&startPoint=1");
		expect(mockRead).toHaveBeenCalledWith("/home/me/.claude", "/repo", null);
	});

	it("rejects a request without cwd", async () => {
		expect(await request("")).toEqual([400, { error: "Missing cwd" }]);
		expect(mockRead).not.toHaveBeenCalled();
	});
});
