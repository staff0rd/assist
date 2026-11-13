import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveRepoLocation } from "../../../backlog/resolveRepoLocation";
import { findAzureDevopsClone } from "./findAzureDevopsClone";
import { findCloneByOrigin } from "./findCloneByOrigin";
import { planGithubSession } from "./planGithubSession";

vi.mock("../../../backlog/resolveRepoLocation", () => ({
	resolveRepoLocation: vi.fn(),
}));
vi.mock("./findCloneByOrigin", () => ({ findCloneByOrigin: vi.fn() }));
vi.mock("./findAzureDevopsClone", () => ({ findAzureDevopsClone: vi.fn() }));

const mockResolve = vi.mocked(resolveRepoLocation);
const mockFind = vi.mocked(findCloneByOrigin);
const URL = "https://github.com/org/repo/issues/12#issuecomment-34";
const PR = "https://github.com/org/repo/pull/12#discussion_r34";

afterEach(() => vi.clearAllMocks());

describe("planGithubSession", () => {
	it("resolves the local clone and uses the link as the prompt", () => {
		mockResolve.mockReturnValue({ cwd: "/base/repo" });
		expect(planGithubSession({ url: URL }, "/base")).toEqual({
			ok: true,
			cwd: "/base/repo",
			prompt: URL,
		});
		expect(mockResolve).toHaveBeenCalledWith(
			"github.com/org/repo",
			undefined,
			"/base",
		);
	});

	it("appends instructions after the link", () => {
		mockResolve.mockReturnValue({ cwd: "/base/repo" });
		expect(
			planGithubSession({ url: URL, instructions: " fix it " }, "/base"),
		).toMatchObject({ prompt: `${URL}\n\nfix it` });
	});

	it("tells a PR prompt to read the PR remotely instead of checking it out", () => {
		mockResolve.mockReturnValue({ cwd: "/base/repo" });
		const plan = planGithubSession({ url: PR, instructions: "why?" }, "/base");
		expect(plan).toMatchObject({ ok: true, cwd: "/base/repo" });
		const { prompt } = plan as { prompt: string };
		expect(prompt.startsWith(`${PR}\n\n`)).toBe(true);
		expect(prompt).toContain("gh pr diff https://github.com/org/repo/pull/12");
		expect(prompt).toContain("do not check out its branch");
		expect(prompt.endsWith("\n\nwhy?")).toBe(true);
	});

	it.each(["draft", "bug"])(
		"carries the %s mode with the same prompt",
		(mode) => {
			mockResolve.mockReturnValue({ cwd: "/base/repo" });
			expect(
				planGithubSession({ url: URL, instructions: "fix it", mode }, "/base"),
			).toEqual({
				ok: true,
				cwd: "/base/repo",
				prompt: `${URL}\n\nfix it`,
				mode,
			});
		},
	);

	it("reports 400 for an unknown mode", () => {
		expect(planGithubSession({ url: URL, mode: "deploy" }, "/base")).toEqual({
			ok: false,
			status: 400,
			error: "Unknown mode: deploy",
		});
		expect(mockResolve).not.toHaveBeenCalled();
	});

	it.each(["draft", "bug"])(
		"reports 404 for a %s when the repo is not cloned",
		(mode) => {
			mockResolve.mockReturnValue({ cloneTarget: "/base/repo" });
			expect(planGithubSession({ url: URL, mode }, "/base")).toMatchObject({
				ok: false,
				status: 404,
			});
		},
	);

	it("reports 404 when the repo is not cloned", () => {
		mockResolve.mockReturnValue({ cloneTarget: "/base/repo" });
		expect(planGithubSession({ url: URL }, "/base")).toEqual({
			ok: false,
			status: 404,
			error: "org/repo is not cloned under /base",
		});
	});

	describe("with extension.redirects", () => {
		const ISSUE = "https://github.com/org/repo/issues/7";
		const redirects = { "org/repo": "other/target" };

		it("opens a mapped repo's issue in the target clone, keeping the link", () => {
			mockResolve.mockReturnValue({ cwd: "/base/target" });
			expect(
				planGithubSession(
					{ url: ISSUE, instructions: "go" },
					"/base",
					redirects,
				),
			).toEqual({ ok: true, cwd: "/base/target", prompt: `${ISSUE}\n\ngo` });
			expect(mockResolve).toHaveBeenCalledWith(
				"github.com/other/target",
				undefined,
				"/base",
			);
		});

		it("opens a mapped repo's bug in the target clone", () => {
			mockResolve.mockReturnValue({ cwd: "/base/target" });
			expect(
				planGithubSession({ url: ISSUE, mode: "bug" }, "/base", redirects),
			).toEqual({ ok: true, cwd: "/base/target", prompt: ISSUE, mode: "bug" });
			expect(mockResolve).toHaveBeenCalledWith(
				"github.com/other/target",
				undefined,
				"/base",
			);
		});

		it("opens an unmapped repo in its own clone", () => {
			mockResolve.mockReturnValue({ cwd: "/base/b" });
			planGithubSession(
				{ url: "https://github.com/a/b/issues/1" },
				"/base",
				redirects,
			);
			expect(mockResolve).toHaveBeenCalledWith(
				"github.com/a/b",
				undefined,
				"/base",
			);
		});

		it("finds a mapped clone checked out under a different folder name", () => {
			mockResolve.mockReturnValue({ cloneTarget: "/base/target" });
			mockFind.mockReturnValueOnce("/base/renamed");
			expect(planGithubSession({ url: ISSUE }, "/base", redirects)).toEqual({
				ok: true,
				cwd: "/base/renamed",
				prompt: ISSUE,
			});
			expect(mockFind).toHaveBeenCalledWith("github.com/other/target", "/base");
		});

		it("names the mapped repo when it is not cloned", () => {
			mockResolve.mockReturnValue({ cloneTarget: "/base/target" });
			expect(planGithubSession({ url: ISSUE }, "/base", redirects)).toEqual({
				ok: false,
				status: 404,
				error: "other/target is not cloned under /base",
			});
		});
	});

	describe("with an Azure DevOps PR", () => {
		const ADO = "https://dev.azure.com/acme/proj/_git/site/pullrequest/42";

		it("prompts in the ADO clone with read-remotely guidance", () => {
			vi.mocked(findAzureDevopsClone).mockReturnValue("/base/site");
			const plan = planGithubSession(
				{ url: ` ${ADO} `, instructions: "why?" },
				"/base",
			);
			expect(plan).toMatchObject({ ok: true, cwd: "/base/site" });
			const { prompt } = plan as { prompt: string };
			expect(prompt.startsWith(`${ADO}\n\n`)).toBe(true);
			expect(prompt).toContain("az repos pr show --id 42");
			expect(prompt).toContain("Do not check out its branch.");
			expect(prompt.endsWith("\n\nwhy?")).toBe(true);
			expect(findAzureDevopsClone).toHaveBeenCalledWith(
				expect.objectContaining({ org: "acme", project: "proj", repo: "site" }),
				"/base",
			);
			expect(mockResolve).not.toHaveBeenCalled();
		});

		it("reports the same not-cloned error as Checkout", () => {
			vi.mocked(findAzureDevopsClone).mockReturnValue(undefined);
			expect(planGithubSession({ url: ADO }, "/base")).toEqual({
				ok: false,
				status: 404,
				error:
					"acme/proj/site is not cloned under /base; clone https://dev.azure.com/acme/proj/_git/site there and retry",
			});
		});
	});

	it("reports 400 for a non-GitHub URL", () => {
		expect(
			planGithubSession({ url: "https://example.com/a/b" }, "/base"),
		).toMatchObject({ ok: false, status: 400 });
		expect(mockResolve).not.toHaveBeenCalled();
	});

	it("reports 400 when the url is missing", () => {
		expect(planGithubSession({}, "/base")).toEqual({
			ok: false,
			status: 400,
			error: "Missing url",
		});
	});
});
