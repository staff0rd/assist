import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRespondJson = vi.fn();
const mockExecFile = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("node:child_process", () => ({
	execFile: (...args: unknown[]) => mockExecFile(...args),
}));

import { githubAttachment } from "./githubAttachment";

type Callback = (error: unknown, result?: { stdout: string }) => void;

const asset = "0b6f7c1e-2d3a-4b5c-8d9e-0123456789ab";

function ghReturns(stdout: string) {
	mockExecFile.mockImplementation((...args: unknown[]) =>
		(args.at(-1) as Callback)(null, { stdout }),
	);
}

async function request(query: string) {
	const res = { writeHead: vi.fn(), end: vi.fn() };
	await githubAttachment(
		{ url: `/api/github-attachment?${query}` } as IncomingMessage,
		res as unknown as ServerResponse,
	);
	return res;
}

describe("githubAttachment", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redirects to the signed URL from the PR's rendered body", async () => {
		const signed = `https://private-user-images.githubusercontent.com/1/2-${asset}.png?jwt=t`;
		ghReturns(`<img src="${signed}">`);

		const res = await request(`repo=acme/app&pr=1&asset=${asset}`);

		expect(res.writeHead).toHaveBeenCalledWith(
			302,
			expect.objectContaining({ Location: signed }),
		);
		const [command, args] = mockExecFile.mock.lastCall as [string, string[]];
		expect(command).toBe("gh");
		expect(args).toContain("repos/acme/app/issues/1");
	});

	it("falls back to the attachment URL when the body has no match", async () => {
		ghReturns("<p>none</p>");

		const res = await request(`repo=acme/app&pr=2&asset=${asset}`);

		expect(res.writeHead).toHaveBeenCalledWith(
			302,
			expect.objectContaining({
				Location: `https://github.com/user-attachments/assets/${asset}`,
			}),
		);
	});

	it.each([
		["a repo without an owner", `repo=app&pr=1&asset=${asset}`],
		["a non-numeric pr", `repo=acme/app&pr=1;x&asset=${asset}`],
		["an asset that is not a uuid", "repo=acme/app&pr=1&asset=../x"],
	])("rejects %s without calling gh", async (_label, query) => {
		await request(query);

		expect(mockRespondJson.mock.lastCall?.[1]).toBe(400);
		expect(mockExecFile).not.toHaveBeenCalled();
	});
});
