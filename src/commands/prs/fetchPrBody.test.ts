import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

const mockExecFileSync = vi.mocked(execFileSync);
const mockGetPreferredRemoteRepo = vi.fn();

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);
vi.mock("./getPreferredRemoteRepo", () => ({
	getPreferredRemoteRepo: () => mockGetPreferredRemoteRepo(),
}));

import { fetchPrBody } from "./fetchPrBody";

let errors: string[];

beforeEach(() => {
	mockExecFileSync.mockReset();
	mockGetPreferredRemoteRepo.mockReset();
	mockGetPreferredRemoteRepo.mockReturnValue({ org: "acme", repo: "widgets" });
	errors = [];
	vi.spyOn(console, "error").mockImplementation((line: string) => {
		errors.push(line);
	});
	vi.spyOn(process, "exit").mockImplementation(() => {
		throw new Error("process.exit");
	});
});

describe("fetchPrBody", () => {
	it("should read the body of a pull request in the current repository", () => {
		mockExecFileSync.mockReturnValue(JSON.stringify({ body: "a body" }));

		expect(fetchPrBody(42, null)).toBe("a body");
		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			["pr", "view", "42", "--json", "body", "-R", "acme/widgets"],
			expect.anything(),
		);
	});

	it("should read the body of a pull request in another repository", () => {
		mockExecFileSync.mockReturnValue(JSON.stringify({ body: "a body" }));

		expect(fetchPrBody(7, { org: "other", repo: "project" })).toBe("a body");
		expect(mockGetPreferredRemoteRepo).not.toHaveBeenCalled();
	});

	it("should treat a pull request with no body as empty", () => {
		mockExecFileSync.mockReturnValue(JSON.stringify({ body: null }));

		expect(fetchPrBody(42, null)).toBe("");
	});

	it("should explain that a number needs a repository to resolve against", () => {
		mockGetPreferredRemoteRepo.mockReturnValue(null);
		mockExecFileSync.mockImplementation(() => {
			throw new Error("fatal: not a git repository");
		});

		expect(() => fetchPrBody(42, null)).toThrow("process.exit");
		expect(errors).toEqual([
			"Error: Could not resolve the current GitHub repository.",
			"Pass a pull request URL, - for stdin, or a path to a file instead of a number.",
		]);
	});

	it("should report a missing pull request", () => {
		mockExecFileSync.mockImplementation(() => {
			throw new Error("GraphQL: Could not resolve to a PullRequest");
		});

		expect(() => fetchPrBody(42, null)).toThrow("process.exit");
		expect(errors[0]).toBe("Error: Pull request acme/widgets#42 not found.");
	});

	it("should report a missing gh", () => {
		mockExecFileSync.mockImplementation(() => {
			throw new Error("spawnSync gh ENOENT");
		});

		expect(() => fetchPrBody(42, null)).toThrow("process.exit");
		expect(errors[0]).toBe("Error: GitHub CLI (gh) is not installed.");
	});
});
