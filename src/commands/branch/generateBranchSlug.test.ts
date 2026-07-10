import { execFile } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateSlug } from "./validateSlug";

vi.mock("node:child_process", () => ({
	execFile: vi.fn(),
}));

import { generateBranchSlug } from "./generateBranchSlug";

const mockExecFile = execFile as unknown as ReturnType<typeof vi.fn>;

function resolveWith(stdout: string): void {
	mockExecFile.mockImplementation(
		(_file, _args, _opts, cb: (e: unknown, r: unknown) => void) => {
			cb(null, { stdout, stderr: "" });
		},
	);
}

describe("generateBranchSlug", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses the LLM suggestion when one is returned", async () => {
		resolveWith("fix-branch-naming\n");

		expect(
			await generateBranchSlug("Fix branch naming so we don't get huge names"),
		).toBe("fix-branch-naming");
		expect(mockExecFile).toHaveBeenCalledWith(
			"claude",
			expect.arrayContaining(["-p", "--model", "haiku"]),
			expect.objectContaining({ encoding: "utf8", timeout: 30_000 }),
			expect.any(Function),
		);
	});

	it("strips wrapping quotes from the suggestion", async () => {
		resolveWith('"fix-login"');

		expect(await generateBranchSlug("Fix the login page")).toBe("fix-login");
	});

	it("sanitises an invalid suggestion into a valid slug", async () => {
		resolveWith("Fix 404 Page");

		const slug = await generateBranchSlug("Fix the 404 page");

		expect(slug).toBe("fix-page");
		expect(validateSlug(slug)).toBeNull();
	});

	it("falls back to the derived slug when the LLM fails", async () => {
		mockExecFile.mockImplementation(
			(_file, _args, _opts, cb: (e: unknown, r: unknown) => void) => {
				cb(new Error("timeout"), null);
			},
		);

		expect(await generateBranchSlug("Add login form")).toBe("add-login-form");
	});

	it("falls back to the derived slug when the LLM returns nothing usable", async () => {
		resolveWith("   \n  ");

		expect(await generateBranchSlug("Add login form")).toBe("add-login-form");
	});
});
