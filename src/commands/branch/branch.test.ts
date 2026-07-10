import { describe, expect, it, vi } from "vitest";

vi.mock("./createBranch", () => ({
	createBranch: vi.fn(),
}));

vi.mock("./generateBranchSlug", () => ({
	generateBranchSlug: vi.fn(),
}));

import { branch } from "./branch";
import { createBranch } from "./createBranch";
import { generateBranchSlug } from "./generateBranchSlug";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockLog = vi.spyOn(console, "log").mockImplementation(() => {});
const mockCreateBranch = createBranch as unknown as ReturnType<typeof vi.fn>;
const mockGenerate = generateBranchSlug as unknown as ReturnType<typeof vi.fn>;

describe("branch", () => {
	it("exits with a clear message when the slug looks like a backlog ID", async () => {
		vi.clearAllMocks();
		await expect(branch("fix-404-page", {})).rejects.toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockError).toHaveBeenCalledWith(expect.stringContaining("backlog"));
	});

	it("shortens a long free-text slug before creating the branch", async () => {
		vi.clearAllMocks();
		mockGenerate.mockReturnValue("fix-branch-naming");
		mockCreateBranch.mockResolvedValue({
			branchName: "fix-branch-naming",
			defaultBranch: "main",
		});

		await expect(
			branch("fix-branch-naming-so-we-dont-ever-get-huge-branch-names", {}),
		).rejects.toThrow("process.exit");

		expect(mockGenerate).toHaveBeenCalledWith(
			"fix-branch-naming-so-we-dont-ever-get-huge-branch-names",
		);
		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "fix-branch-naming",
			jira: undefined,
		});
		expect(mockLog).toHaveBeenCalledWith(expect.stringContaining("Shortened"));
		expect(mockExit).toHaveBeenCalledWith(0);
	});

	it("leaves a concise slug unchanged", async () => {
		vi.clearAllMocks();
		mockCreateBranch.mockResolvedValue({
			branchName: "add-login-form",
			defaultBranch: "main",
		});

		await expect(branch("add-login-form", {})).rejects.toThrow("process.exit");

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(mockCreateBranch).toHaveBeenCalledWith({
			slug: "add-login-form",
			jira: undefined,
		});
	});
});
