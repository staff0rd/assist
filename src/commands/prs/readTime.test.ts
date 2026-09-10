import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockReadBodyArgument = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));
vi.mock("node:fs", () => ({
	readFileSync: (...args: unknown[]) => mockReadFileSync(...args),
}));
vi.mock("./readBodyArgument", () => ({
	readBodyArgument: (...args: unknown[]) => mockReadBodyArgument(...args),
}));
vi.mock("./shared", () => ({
	getRepoInfo: () => ({ org: "acme", repo: "widgets" }),
	isGhNotInstalled: () => false,
	isNotFound: () => false,
}));
vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockConfig,
}));

import { readTime } from "./readTime";

let logged: string[];
let mockConfig: { prs?: { readingWordsPerMinute?: number } };

function words(count: number): string {
	return Array.from({ length: count }, (_, i) => `word${i}`).join(" ");
}

beforeEach(() => {
	mockExecSync.mockReset();
	mockReadFileSync.mockReset();
	mockReadBodyArgument.mockReset();
	mockConfig = {};
	logged = [];
	vi.spyOn(console, "log").mockImplementation((line: string) => {
		logged.push(line);
	});
});

describe("readTime", () => {
	describe("when the target is a PR number", () => {
		it("should print the word count and read time for that PR", async () => {
			mockExecSync.mockReturnValue(JSON.stringify({ body: words(200) }));

			await readTime("42");

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr view 42 --json body -R acme/widgets",
				expect.anything(),
			);
			expect(logged).toEqual(["200 words · ~1m read"]);
		});

		it("should count fenced code at half the prose rate", async () => {
			const body = ["```", words(50), "```"].join("\n");
			mockExecSync.mockReturnValue(JSON.stringify({ body }));

			await readTime("42");

			expect(logged).toEqual(["50 words · ~30s read"]);
		});

		it("should count an image and a URL as one word each", async () => {
			mockExecSync.mockReturnValue(
				JSON.stringify({
					body: "![a shot of the screen](https://img/x.png) see https://example.com/a",
				}),
			);

			await readTime("42");

			expect(logged).toEqual(["3 words · ~1s read"]);
		});

		it("should handle a PR with an empty body", async () => {
			mockExecSync.mockReturnValue(JSON.stringify({ body: null }));

			await readTime("42");

			expect(logged).toEqual(["0 words · ~0s read"]);
		});
	});

	describe("when the target is a GitHub pull request URL", () => {
		it("should read the PR from the URL's repo", async () => {
			mockExecSync.mockReturnValue(JSON.stringify({ body: words(100) }));

			await readTime("https://github.com/other/project/pull/7");

			expect(mockExecSync).toHaveBeenCalledWith(
				"gh pr view 7 --json body -R other/project",
				expect.anything(),
			);
			expect(logged).toEqual(["100 words · ~30s read"]);
		});
	});

	describe("when the target is -", () => {
		it("should read the body from stdin", async () => {
			mockReadBodyArgument.mockResolvedValue(words(50));

			await readTime("-");

			expect(mockReadBodyArgument).toHaveBeenCalledWith("-");
			expect(logged).toEqual(["50 words · ~15s read"]);
		});
	});

	describe("when the target is a file path", () => {
		it("should read the body from the file", async () => {
			mockReadFileSync.mockReturnValue("one\ntwo\n\n  three  ");

			await readTime("drafts/body.md");

			expect(mockReadFileSync).toHaveBeenCalledWith("drafts/body.md", "utf8");
			expect(logged).toEqual(["3 words · ~1s read"]);
		});

		it("should print a single word in the singular", async () => {
			mockReadFileSync.mockReturnValue("solo");

			await readTime("drafts/body.md");

			expect(logged).toEqual(["1 word · ~0s read"]);
		});

		it("should note when the estimate is over the default one minute budget", async () => {
			mockReadFileSync.mockReturnValue(words(300));

			await readTime("drafts/body.md");

			expect(logged).toEqual([
				"300 words · ~1m 30s read · over the ~1m budget",
			]);
		});

		it("should not note a budget the estimate lands exactly on", async () => {
			mockReadFileSync.mockReturnValue(words(200));

			await readTime("drafts/body.md");

			expect(logged).toEqual(["200 words · ~1m read"]);
		});

		it("should judge the estimate against --budget", async () => {
			mockReadFileSync.mockReturnValue(words(300));

			await readTime("drafts/body.md", { budget: "2m" });

			expect(logged).toEqual(["300 words · ~1m 30s read"]);
		});

		it("should note a budget of seconds the estimate exceeds", async () => {
			mockReadFileSync.mockReturnValue(words(200));

			await readTime("drafts/body.md", { budget: "45s" });

			expect(logged).toEqual(["200 words · ~1m read · over the ~45s budget"]);
		});

		it("should note a compound budget the estimate exceeds", async () => {
			mockReadFileSync.mockReturnValue(words(400));

			await readTime("drafts/body.md", { budget: "1m30s" });

			expect(logged).toEqual([
				"400 words · ~2m read · over the ~1m 30s budget",
			]);
		});

		it("should exit when the budget cannot be parsed", async () => {
			mockReadFileSync.mockReturnValue(words(10));
			const exit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("process.exit");
			});
			const errors: string[] = [];
			vi.spyOn(console, "error").mockImplementation((line: string) => {
				errors.push(line);
			});

			await expect(
				readTime("drafts/body.md", { budget: "2 hours" }),
			).rejects.toThrow("process.exit");
			expect(exit).toHaveBeenCalledWith(1);
			expect(errors[0]).toContain('Invalid budget "2 hours"');
			expect(mockReadFileSync).not.toHaveBeenCalled();
		});

		it("should read prose at the configured words per minute", async () => {
			mockConfig = { prs: { readingWordsPerMinute: 100 } };
			mockReadFileSync.mockReturnValue(words(100));

			await readTime("drafts/body.md");

			expect(logged).toEqual(["100 words · ~1m read"]);
		});

		it("should exit when the file cannot be read", async () => {
			mockReadFileSync.mockImplementation(() => {
				throw new Error("ENOENT");
			});
			const exit = vi.spyOn(process, "exit").mockImplementation(() => {
				throw new Error("process.exit");
			});
			vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(readTime("missing.md")).rejects.toThrow("process.exit");
			expect(exit).toHaveBeenCalledWith(1);
		});
	});
});
