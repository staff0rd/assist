import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultBranchRef } from "./defaultBranchRef";
import { diffScopes } from "./diffScopes";
import { itemScopeCommits } from "./itemScopeCommits";

vi.mock("./itemScopeCommits", () => ({ itemScopeCommits: vi.fn() }));
vi.mock("./defaultBranchRef", () => ({ defaultBranchRef: vi.fn() }));

const itemScopeCommitsMock = vi.mocked(itemScopeCommits);
const defaultBranchRefMock = vi.mocked(defaultBranchRef);

async function request(
	url = "/api/diff-scopes?cwd=%2Frepo&session=sess-1",
): Promise<{ status: number; body: unknown }> {
	let status = 0;
	let body = "";
	const res = {
		writeHead: (code: number) => {
			status = code;
		},
		end: (chunk?: string) => {
			body = chunk ?? "";
		},
	} as unknown as ServerResponse;
	await diffScopes({ url } as IncomingMessage, res);
	return { status, body: body ? JSON.parse(body) : undefined };
}

describe("diffScopes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		itemScopeCommitsMock.mockResolvedValue([]);
		defaultBranchRefMock.mockResolvedValue(undefined);
	});

	it("rejects a request without a cwd", async () => {
		const { status } = await request("/api/diff-scopes");

		expect(status).toBe(400);
		expect(itemScopeCommitsMock).not.toHaveBeenCalled();
	});

	it("returns the item's commits with their subject and url", async () => {
		itemScopeCommitsMock.mockResolvedValue([
			{ sha: "one", title: "feat: one", url: "https://host/one" },
			{ sha: "two", title: "fix: two" },
		]);

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toEqual({
			commits: [
				{ sha: "one", title: "feat: one", url: "https://host/one" },
				{ sha: "two", title: "fix: two" },
			],
			branchBase: null,
		});
		expect(itemScopeCommitsMock).toHaveBeenCalledWith("/repo", {
			conversationId: "sess-1",
		});
	});

	it("returns no commits when the request carries no session", async () => {
		await request("/api/diff-scopes?cwd=%2Frepo");

		expect(itemScopeCommitsMock).toHaveBeenCalledWith("/repo", undefined);
	});

	it("returns no commits when the lookup fails", async () => {
		itemScopeCommitsMock.mockRejectedValue(new Error("database unreachable"));

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toEqual({ commits: [], branchBase: null });
	});

	it("returns the resolved default branch ref as the branch base", async () => {
		defaultBranchRefMock.mockResolvedValue("origin/main");

		const { body } = await request();

		expect(body).toEqual({ commits: [], branchBase: "origin/main" });
		expect(defaultBranchRefMock).toHaveBeenCalledWith("/repo");
	});

	it("returns a null branch base when the lookup throws", async () => {
		defaultBranchRefMock.mockRejectedValue(new Error("not a repository"));

		const { status, body } = await request();

		expect(status).toBe(200);
		expect(body).toEqual({ commits: [], branchBase: null });
	});
});
