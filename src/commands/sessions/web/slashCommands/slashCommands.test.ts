import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();
const mockRead = vi.fn();

vi.mock("../../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../../shared/harnesses", () => ({
	harnesses: { claude: { homeDir: "/home/me/.claude" } },
}));

vi.mock("./readSlashCommands", () => ({
	readSlashCommands: (...args: unknown[]) => mockRead(...args),
}));

import { slashCommands } from "./slashCommands";

function request(query: string) {
	slashCommands(
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

	it("lists the Claude home's user skills and commands", () => {
		expect(request("cwd=/repo")).toEqual([
			200,
			{ commands: [{ name: "draft", scope: "user" }] },
		]);
		expect(mockRead).toHaveBeenCalledWith("/home/me/.claude", "user");
	});

	it("rejects a request without cwd", () => {
		expect(request("")).toEqual([400, { error: "Missing cwd" }]);
		expect(mockRead).not.toHaveBeenCalled();
	});
});
