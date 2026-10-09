import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

const mockExecFileSync = vi.mocked(execFileSync);
vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockFindCurrentPrNumber = vi.fn();
vi.mock("./shared", () => ({
	findCurrentPrNumber: () => mockFindCurrentPrNumber(),
}));

vi.mock("../../shared/loadJson", () => ({
	loadJson: () => ({ site: "example.atlassian.net" }),
}));

vi.mock("./recordPrActivity", () => ({ recordPrActivity: vi.fn() }));

const mockLoadConfig = vi.mocked(loadConfig);
vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockRequestPrDecision = vi.fn();
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPrDecision(...args),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

import { raise } from "./raise";

const GH_OPTIONS = { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] };

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset().mockReturnValue("");
	mockFindCurrentPrNumber.mockReturnValue(null);
	mockLoadConfig.mockReturnValue(makeAssistConfig());
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

const CLI = { getOptionValueSource: () => "cli" };
const DEFAULTED = { getOptionValueSource: () => "default" };

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
				GH_OPTIONS,
			);
		});

		it("renders --screenshot specs grouped and attaches the files", async () => {
			const dir = mkdtempSync(join(tmpdir(), "raise-screenshot-"));
			const light = join(dir, "a.png");
			const dark = join(dir, "b.png");
			writeFileSync(light, "");
			writeFileSync(dark, "");

			await raise({
				title: "feat: x",
				what: "Adds x",
				why: "Needed x",
				screenshot: [
					`Profile/Career Connect light=${light}`,
					`Profile/Career Connect dark=${dark}`,
				],
			});

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"create",
					"--title",
					"feat: x",
					"--body",
					`## What\n\nAdds x\n\n## Why\n\nNeeded x\n\n## Screenshots\n\n### Profile\n\n| Career Connect light | Career Connect dark |\n| --- | --- |\n| ![Career Connect light](${light}) | ![Career Connect dark](${dark}) |`,
					"--attach",
					light,
					"--attach",
					dark,
				],
				{ encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] },
			);
		});

		it("exits naming a bad --screenshot spec before any gh call", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(
				raise({
					title: "feat: x",
					what: "Adds x",
					why: "Needed x",
					screenshot: ["X=missing.png"],
				}),
			).rejects.toThrow("process.exit");

			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(errorSpy.mock.calls[0][0]).toContain("'X=missing.png'");
			errorSpy.mockRestore();
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
				GH_OPTIONS,
			);
		});
	});

	describe("draft state", () => {
		function ghArgs(): string[] {
			const call = mockExecFileSync.mock.calls.find(
				([bin, args]) => bin === "gh" && (args as string[])[1] === "create",
			);
			return (call?.[1] as string[]) ?? [];
		}

		it("passes --draft when prs.draft is true and no flag is given", () => {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ prs: { draft: true } }),
			);

			raise({ title: "t", what: "w", why: "y" }, DEFAULTED);

			expect(ghArgs()).toContain("--draft");
		});

		it("omits --draft when prs.draft is unset and no flag is given", () => {
			raise({ title: "t", what: "w", why: "y" }, DEFAULTED);

			expect(ghArgs()).not.toContain("--draft");
		});

		it("passes --draft when the flag is given and prs.draft is false", () => {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ prs: { draft: false } }),
			);

			raise({ title: "t", what: "w", why: "y", draft: true }, CLI);

			expect(ghArgs()).toContain("--draft");
		});

		it("omits --draft for --no-draft even when prs.draft is true", () => {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ prs: { draft: true } }),
			);

			raise({ title: "t", what: "w", why: "y", draft: false }, CLI);

			expect(ghArgs()).not.toContain("--draft");
		});

		it("never sends a draft flag when updating an existing PR", () => {
			mockLoadConfig.mockReturnValue(
				makeAssistConfig({ prs: { draft: true } }),
			);
			mockFindCurrentPrNumber.mockReturnValue(42);

			raise({ title: "t", what: "w", why: "y", force: true }, DEFAULTED);

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
				GH_OPTIONS,
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
				GH_OPTIONS,
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
				GH_OPTIONS,
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
				GH_OPTIONS,
			);
		});
	});
});
