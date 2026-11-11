import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();

vi.mock("../../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));
vi.mock("../execGit", () => ({ execGit: vi.fn() }));
vi.mock("../itemScopeCommits", () => ({ itemScopeCommits: vi.fn() }));

import { execGit } from "../execGit";
import { fileContent } from "../fileContent";
import { itemScopeCommits } from "../itemScopeCommits";

const execGitMock = vi.mocked(execGit);
const itemScopeCommitsMock = vi.mocked(itemScopeCommits);
const SHA = "abc1234";

function withGit(responder: (args: string[]) => string): void {
	execGitMock.mockImplementation(async (_cwd, args) => responder(args));
}

async function request(
	query: string,
): Promise<[number, Record<string, unknown>]> {
	await fileContent(
		{
			url: `/api/file?cwd=%2Frepo&session=conv-1&${query}`,
		} as IncomingMessage,
		{} as ServerResponse,
	);
	const [, status, body] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		Record<string, unknown>,
	];
	return [status, body];
}

function blobLine(size: number): string {
	return `100644 blob deadbeef ${String(size).padStart(7)}\tsrc/app.ts\n`;
}

describe("fileContent with a commit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemScopeCommitsMock.mockResolvedValue([
			{ sha: SHA, subject: "feat: app" } as never,
		]);
	});

	it("returns the file as of the commit", async () => {
		withGit((args) => (args[0] === "ls-tree" ? blobLine(12) : "old content\n"));

		const [status, body] = await request(`path=src%2Fapp.ts&commit=${SHA}`);

		expect(status).toBe(200);
		expect(body.content).toBe("old content\n");
		expect(execGitMock).toHaveBeenCalledWith("/repo", [
			"ls-tree",
			"-l",
			SHA,
			"--",
			"src/app.ts",
		]);
		expect(execGitMock).toHaveBeenCalledWith(
			"/repo",
			["cat-file", "blob", "deadbeef"],
			expect.anything(),
		);
	});

	it("rejects a commit outside the session's scope list", async () => {
		const [status, body] = await request("path=src%2Fapp.ts&commit=fff9999");

		expect(status).toBe(400);
		expect(body.error).toBe("Invalid commit");
		expect(execGitMock).not.toHaveBeenCalled();
	});

	it("rejects a non-commit scope name", async () => {
		const [status] = await request("path=src%2Fapp.ts&commit=all");

		expect(status).toBe(400);
	});

	it("returns 404 when the path is not in the commit", async () => {
		withGit(() => "");

		const [status, body] = await request(`path=gone.ts&commit=${SHA}`);

		expect(status).toBe(404);
		expect(body.error).toBe("File not found");
	});

	it("returns 413 when the file is too large", async () => {
		withGit(() => blobLine(3 * 1024 * 1024));

		const [status, body] = await request(`path=src%2Fapp.ts&commit=${SHA}`);

		expect(status).toBe(413);
		expect(body.error).toBe("File too large");
		expect(execGitMock).toHaveBeenCalledTimes(1);
	});

	it("still rejects a path outside the cwd", async () => {
		const [status] = await request(`path=..%2Fsecret&commit=${SHA}`);

		expect(status).toBe(400);
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});
});
