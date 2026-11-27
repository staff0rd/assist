import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const execFileSync = vi.fn();
const pushCommit = vi.fn();
const mockRequestPreviewDecision = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => execFileSync(...args),
}));
vi.mock("../commit/pushCommit", () => ({
	pushCommit: (...args: unknown[]) => pushCommit(...args),
}));
vi.mock("../../shared/loadConfig", () => ({ loadConfig: () => ({}) }));
vi.mock("../review/azureDevopsRemote", () => ({
	azureDevopsRemote: () => null,
}));
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));
vi.mock("./shared", () => ({
	isGhNotInstalled: () => false,
	getCurrentPrNumber: () => 5,
	getRepoInfo: () => ({ org: "o", repo: "r" }),
}));

import { reviewReply } from "./reviewReply";

const reviewUrl = "https://github.com/o/r/pull/5#pullrequestreview-99";
const goodSha = "a".repeat(40);
const missingSha = "b".repeat(40);

function ghResponses(): void {
	execFileSync.mockImplementation((command: string, args: string[]) => {
		if (command === "git") {
			if (args.includes(missingSha)) throw new Error("bad object");
			return "commit";
		}
		if (args.includes("POST"))
			return JSON.stringify({
				html_url: "https://github.com/o/r/pull/5#issuecomment-1",
			});
		return JSON.stringify({
			id: 99,
			user: { login: "graft" },
			html_url: reviewUrl,
		});
	});
}

function postedBody(): string {
	const call = execFileSync.mock.calls.find((c) =>
		(c[1] as string[]).includes("POST"),
	);
	const field = ((call?.[1] as string[] | undefined) ?? []).find((a) =>
		a.startsWith("body="),
	);
	return field?.slice("body=".length) ?? "";
}

function exitThrows(): void {
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(process, "exit").mockImplementation((() => {
		throw new Error("process.exit");
	}) as never);
}

beforeEach(() => {
	execFileSync.mockReset();
	pushCommit.mockReset();
	mockRequestPreviewDecision.mockReset();
	ghResponses();
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("reviewReply", () => {
	it("posts a PR comment linking the review and ending with the handled marker", async () => {
		await reviewReply(99, "- Fixed the leak\n- Won't fix: out of scope");

		const body = postedBody();
		expect(body).toContain(`[review by graft](${reviewUrl})`);
		expect(body).toContain("- Fixed the leak");
		expect(body.endsWith("<!-- assist-review-handled: 99 -->")).toBe(true);
		const post = execFileSync.mock.calls.find((c) =>
			(c[1] as string[]).includes("POST"),
		);
		expect(post?.[1]).toContain("repos/o/r/issues/5/comments");
	});

	it("pushes pending commits before posting", async () => {
		await reviewReply(99, "Done");

		expect(pushCommit).toHaveBeenCalledWith(false);
		const pushOrder = pushCommit.mock.invocationCallOrder[0] ?? 0;
		const postIndex = execFileSync.mock.calls.findIndex((c) =>
			(c[1] as string[]).includes("POST"),
		);
		expect(pushOrder).toBeLessThan(
			execFileSync.mock.invocationCallOrder[postIndex] ?? 0,
		);
	});

	it("previews the full comment in a web session and posts on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await reviewReply(99, "Done");

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Reply to review #99",
				titleLink: { reference: "#99", url: reviewUrl },
				body: expect.stringContaining("<!-- assist-review-handled: 99 -->"),
				kind: "pr-comment",
				prNumber: 5,
			}),
		);
		expect(postedBody()).not.toBe("");
	});

	it("does not post when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "s1";
		exitThrows();
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "no",
		});

		await expect(reviewReply(99, "Done")).rejects.toThrow("process.exit");
		expect(postedBody()).toBe("");
	});

	it("rejects a body that mentions the assistant", async () => {
		exitThrows();

		await expect(reviewReply(99, "Fixed by Claude")).rejects.toThrow(
			"process.exit",
		);
		expect(pushCommit).not.toHaveBeenCalled();
		expect(postedBody()).toBe("");
	});

	it("rejects a commit link to a SHA not in the repo", async () => {
		exitThrows();

		await expect(
			reviewReply(
				99,
				`Fixed in [bbbbbbb](https://github.com/o/r/commit/${missingSha})`,
			),
		).rejects.toThrow("process.exit");
		expect(postedBody()).toBe("");
	});

	it("accepts a commit link to a SHA in the repo", async () => {
		await reviewReply(
			99,
			`Fixed in [aaaaaaa](https://github.com/o/r/commit/${goodSha})`,
		);

		expect(postedBody()).toContain(goodSha);
	});
});
