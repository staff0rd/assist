import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExecFileSync = vi.fn();
vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

const mockFindCurrentPrNumber = vi.fn();
vi.mock("./shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

vi.mock("../../shared/loadJson", () => ({
	loadJson: () => ({ site: "example.atlassian.net" }),
}));

vi.mock("./recordPrActivity", () => ({ recordPrActivity: vi.fn() }));

const mockRequestPrDecision = vi.fn();
vi.mock("./requestPrDecision", () => ({
	requestPrDecision: (...args: unknown[]) => mockRequestPrDecision(...args),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

import { raise } from "./raise";

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset();
	mockFindCurrentPrNumber.mockReturnValue(null);
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("raise", () => {
	describe("when required sections are missing", () => {
		it("rejects without title", async () => {
			await expect(raise({ what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});

		it("rejects without what", async () => {
			await expect(raise({ title: "t", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});

		it("rejects without why", async () => {
			await expect(raise({ title: "t", what: "w" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});
	});

	describe("when the title references Claude", () => {
		it("rejects without calling gh", async () => {
			await expect(
				raise({ title: "Built by Claude", what: "w", why: "y" }),
			).rejects.toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});
	});

	describe("when no PR exists", () => {
		it("creates the PR with an assembled body", () => {
			raise({ title: "feat: x", what: "Adds x", why: "Needed x" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"create",
					"--title",
					"feat: x",
					"--body",
					"## What\n\nAdds x\n\n## Why\n\nNeeded x",
				],
				{ stdio: "inherit" },
			);
		});

		it("pushes the branch before creating", () => {
			raise({ title: "feat: x", what: "Adds x", why: "Needed x" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"git",
				expect.arrayContaining(["push"]),
				expect.anything(),
			);
		});

		it("appends resolved Jira URLs to Why", () => {
			raise({
				title: "feat: x",
				what: "Adds x",
				why: "Needed x",
				resolves: ["BAD-671"],
			});

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				expect.arrayContaining([
					expect.stringContaining(
						"Resolves https://example.atlassian.net/browse/BAD-671",
					),
				]),
				{ stdio: "inherit" },
			);
		});
	});

	describe("when a PR already exists", () => {
		beforeEach(() => {
			mockFindCurrentPrNumber.mockReturnValue(42);
		});

		it("errors without --force", async () => {
			await expect(raise({ title: "t", what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});

		it("overwrites title and body with --force, without pushing", () => {
			raise({ title: "t", what: "w", why: "y", force: true });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"edit",
					"42",
					"--title",
					"t",
					"--body",
					"## What\n\nw\n\n## Why\n\ny",
				],
				{ stdio: "inherit" },
			);
			expect(mockExecFileSync).not.toHaveBeenCalledWith(
				"git",
				expect.anything(),
				expect.anything(),
			);
		});
	});

	describe("when gh fails", () => {
		it("exits with code 1", async () => {
			mockExecFileSync.mockImplementation(() => {
				throw new Error("gh failed");
			});

			await expect(raise({ title: "t", what: "w", why: "y" })).rejects.toThrow(
				"process.exit",
			);
			expect(mockExit).toHaveBeenCalledWith(1);
		});
	});

	describe("when running inside a web session", () => {
		beforeEach(() => {
			process.env.ASSIST_SESSION = "1";
			process.env.ASSIST_SESSION_ID = "7";
		});

		afterEach(() => {
			delete process.env.ASSIST_SESSION;
			delete process.env.ASSIST_SESSION_ID;
		});

		it("places the PR after the UI approves", async () => {
			mockRequestPrDecision.mockResolvedValue({ decision: "approve" });

			await raise({ title: "feat: x", what: "Adds x", why: "Needed x" });

			expect(mockRequestPrDecision).toHaveBeenCalledWith(
				expect.objectContaining({ sessionId: "7", prNumber: null }),
			);
			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				expect.arrayContaining(["pr", "create"]),
				{ stdio: "inherit" },
			);
		});

		it("exits non-zero and does not place when the UI rejects", async () => {
			mockRequestPrDecision.mockResolvedValue({
				decision: "reject",
				reason: "needs work",
			});

			await expect(
				raise({ title: "feat: x", what: "Adds x", why: "Needed x" }),
			).rejects.toThrow("process.exit");
			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecFileSync).not.toHaveBeenCalled();
		});

		it("prints quoted-span + note pairs to stderr on reject-with-comments", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			mockRequestPrDecision.mockResolvedValue({
				decision: "reject",
				comments: [
					{ quote: "Adds x", note: "say what x is" },
					{ quote: "Needed x", note: "link the issue" },
				],
			});

			await expect(
				raise({ title: "feat: x", what: "Adds x", why: "Needed x" }),
			).rejects.toThrow("process.exit");

			const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
			expect(output).toContain("> Adds x");
			expect(output).toContain("say what x is");
			expect(output).toContain("> Needed x");
			expect(output).toContain("link the issue");
			expect(mockExecFileSync).not.toHaveBeenCalled();
			errorSpy.mockRestore();
		});

		it("updates an existing PR after approval without needing --force", async () => {
			mockFindCurrentPrNumber.mockReturnValue(42);
			mockRequestPrDecision.mockResolvedValue({ decision: "approve" });

			await raise({ title: "t", what: "w", why: "y" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				expect.arrayContaining(["pr", "edit", "42"]),
				{ stdio: "inherit" },
			);
		});
	});
});
