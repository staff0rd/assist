import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	PreviewDecision,
	PreviewReviewComment,
} from "../../sessions/shared/PreviewDecision";
import type { PreviewRequest } from "../../sessions/shared/requestPreviewDecision";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { openHighLevelOverlay } from "./openHighLevelOverlay";
import type { HighLevelFile } from "./types";

const mockAwaitPreviewApproval =
	vi.fn<
		(subject: string, request: PreviewRequest) => Promise<PreviewDecision>
	>();
const mockSaveHighLevelReview = vi.fn(() => "/store/review.json");

vi.mock("../../sessions/shared/awaitPreviewApproval", () => ({
	awaitPreviewApproval: (subject: string, request: PreviewRequest) =>
		mockAwaitPreviewApproval(subject, request),
}));

const mockExecFileSync = vi.fn();

vi.mock("node:child_process", () => ({
	execFileSync: (...args: unknown[]) => mockExecFileSync(...args),
}));

vi.mock("./saveHighLevelReview", () => ({
	saveHighLevelReview: (...args: unknown[]) =>
		mockSaveHighLevelReview(...(args as [])),
}));

const mockSaveHighLevelDraft = vi.fn();
const mockClearHighLevelDraft = vi.fn();

vi.mock("./saveHighLevelDraft", () => ({
	saveHighLevelDraft: (...args: unknown[]) => mockSaveHighLevelDraft(...args),
}));

vi.mock("./clearHighLevelDraft", () => ({
	clearHighLevelDraft: (...args: unknown[]) => mockClearHighLevelDraft(...args),
}));

const mockDiscardHighLevelProgress = vi.fn();

vi.mock("./discardHighLevelProgress", () => ({
	discardHighLevelProgress: (...args: unknown[]) =>
		mockDiscardHighLevelProgress(...args),
}));

const mockFetchHighLevelFiles = vi.fn<() => HighLevelFile[]>();

vi.mock("./fetchHighLevelFiles", () => ({
	fetchHighLevelFiles: () => mockFetchHighLevelFiles(),
}));

const subject: HighLevelOverlaySubject = {
	repo: "org/repo",
	prNumber: 42,
	title: "A change",
	headRef: "feat/thing",
	headSha: "abc123",
	checks: [
		{
			id: "structure-sensible",
			kind: "manual",
			title: "Structure",
			short: "Structure",
			backing: "tree",
			status: "manual",
			reason: "tree",
		},
	],
	structure: {
		tree: [],
		added: 0,
		removed: 0,
		modified: 0,
		additions: 0,
		deletions: 0,
	},
	criticalDiffs: [],
	criticalPaths: [],
	tests: [],
	testPaths: [],
	collapsedPaths: [],
};

const queued: PreviewReviewComment = {
	path: "src/a.test.ts",
	startLine: 4,
	endLine: 4,
	quote: "starts",
	note: "asserts nothing",
};

const expectedBody = [
	"- 💬 **Structure** — Split it",
	"",
	"**Comments**",
	"",
	"- `src/a.test.ts:4` starts: asserts nothing",
].join("\n");

function ghReview(
	event: string,
	body?: string,
	comments: Record<string, unknown>[] = [],
) {
	return [
		"gh",
		[
			"api",
			"repos/org/repo/pulls/42/reviews",
			"--method",
			"POST",
			"--input",
			"-",
		],
		expect.objectContaining({
			input: JSON.stringify({ event, ...(body ? { body } : {}), comments }),
		}),
	];
}

function queuedDecision(
	decision: PreviewDecision["decision"],
	reviewEvent: PreviewDecision["reviewEvent"],
): PreviewDecision {
	return {
		decision,
		reviewEvent,
		checklist: [
			{ id: "structure-sensible", ticked: true, comment: "Split it" },
		],
		reviewComments: [queued],
	};
}

let log: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;
let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	mockAwaitPreviewApproval.mockReset();
	mockSaveHighLevelReview.mockClear();
	mockSaveHighLevelDraft.mockClear();
	mockClearHighLevelDraft.mockClear();
	mockExecFileSync.mockReset();
	mockFetchHighLevelFiles.mockReset().mockReturnValue([]);
	log = vi.spyOn(console, "log").mockImplementation(() => {});
	error = vi.spyOn(console, "error").mockImplementation(() => {});
	exit = vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new Error(`exit ${code}`);
	});
});

afterEach(() => {
	log.mockRestore();
	error.mockRestore();
	exit.mockRestore();
});

describe("openHighLevelOverlay", () => {
	it("keeps the progress as a draft and posts nothing when the review is closed without a verdict", async () => {
		mockAwaitPreviewApproval.mockResolvedValue({
			...queuedDecision("reject", undefined),
			dismissed: true,
		});

		const record = await openHighLevelOverlay("s1", subject);

		expect(record).toBeUndefined();
		expect(mockSaveHighLevelReview).not.toHaveBeenCalled();
		expect(mockClearHighLevelDraft).not.toHaveBeenCalled();
		expect(mockExecFileSync).not.toHaveBeenCalled();
		expect(mockSaveHighLevelDraft).toHaveBeenCalledWith(
			expect.objectContaining({
				repo: "org/repo",
				headRef: "feat/thing",
				headSha: "abc123",
				items: [
					expect.objectContaining({
						id: "structure-sensible",
						ticked: true,
						comment: "Split it",
					}),
				],
				reviewComments: [queued],
			}),
		);
	});

	it("discards the head's progress and asks to restart when the reviewer starts fresh", async () => {
		mockAwaitPreviewApproval.mockResolvedValue({
			...queuedDecision("reject", undefined),
			dismissed: true,
			restart: true,
		});

		const onRestart = vi.fn(async () => {});

		const record = await openHighLevelOverlay("s1", subject, onRestart);

		expect(record).toBeUndefined();
		expect(onRestart).toHaveBeenCalledOnce();
		expect(mockDiscardHighLevelProgress).toHaveBeenCalledWith(
			"org/repo",
			"feat/thing",
			"abc123",
		);
		expect(mockSaveHighLevelDraft).not.toHaveBeenCalled();
		expect(mockSaveHighLevelReview).not.toHaveBeenCalled();
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	it("clears the draft once a verdict is saved", async () => {
		mockAwaitPreviewApproval.mockResolvedValue({
			decision: "approve",
			checklist: [],
		});

		await openHighLevelOverlay("s1", subject);

		expect(mockClearHighLevelDraft).toHaveBeenCalledWith(
			"org/repo",
			"feat/thing",
			"abc123",
		);
	});

	it("approves straight away with an empty queue", async () => {
		mockAwaitPreviewApproval.mockResolvedValue({
			decision: "approve",
			reviewEvent: "APPROVE",
			checklist: [],
		});

		const record = await openHighLevelOverlay("s1", subject);

		expect(record?.verdict).toBe("approve");
		expect(mockSaveHighLevelReview).toHaveBeenCalledWith(record);
		expect(mockAwaitPreviewApproval).toHaveBeenCalledOnce();
		expect(mockFetchHighLevelFiles).not.toHaveBeenCalled();
		expect(mockExecFileSync).toHaveBeenCalledWith(...ghReview("APPROVE"));
		expect(log).toHaveBeenCalledWith("Review (APPROVE) posted to org/repo#42.");
	});

	it.each([
		["approve", "APPROVE"],
		["approve", "COMMENT"],
		["reject", "REQUEST_CHANGES"],
	] as const)(
		"posts the queued %s/%s review without a second preview",
		async (decision, reviewEvent) => {
			mockAwaitPreviewApproval.mockResolvedValueOnce(
				queuedDecision(decision, reviewEvent),
			);

			const record = await openHighLevelOverlay("s1", subject);

			expect(record?.reviewComments).toEqual([queued]);
			expect(mockAwaitPreviewApproval).toHaveBeenCalledOnce();
			expect(mockExecFileSync).toHaveBeenCalledOnce();
			expect(mockExecFileSync).toHaveBeenCalledWith(
				...ghReview(reviewEvent, expectedBody),
			);
		},
	);

	it("posts queued comments on diff lines as line-level comments", async () => {
		mockFetchHighLevelFiles.mockReturnValue([
			{
				path: "src/a.test.ts",
				status: "modified",
				additions: 1,
				deletions: 0,
				diffUrl: "https://github.com/org/repo/pull/42/files#diff-a",
				patch: "@@ -3,1 +3,2 @@\n keep\n+starts",
			},
		]);
		mockAwaitPreviewApproval.mockResolvedValueOnce(
			queuedDecision("approve", "COMMENT"),
		);

		await openHighLevelOverlay("s1", subject);

		expect(mockAwaitPreviewApproval).toHaveBeenCalledOnce();
		expect(mockExecFileSync).toHaveBeenCalledWith(
			...ghReview("COMMENT", "- 💬 **Structure** — Split it", [
				{
					path: "src/a.test.ts",
					body: "asserts nothing",
					line: 4,
					side: "RIGHT",
				},
			]),
		);
	});

	it("puts every queued comment in the PR-level body when the diff can't be read", async () => {
		mockFetchHighLevelFiles.mockImplementation(() => {
			throw new Error("offline");
		});
		mockAwaitPreviewApproval.mockResolvedValueOnce(
			queuedDecision("approve", "COMMENT"),
		);

		await openHighLevelOverlay("s1", subject);

		expect(mockExecFileSync).toHaveBeenCalledWith(
			...ghReview("COMMENT", expectedBody),
		);
	});

	it.each([
		["approve", "COMMENT", "comment"],
		["reject", "REQUEST_CHANGES", "request-changes"],
	] as const)(
		"posts nothing for a %s/%s verdict with nothing to say",
		async (decision, reviewEvent, verdict) => {
			mockAwaitPreviewApproval.mockResolvedValue({
				decision,
				reviewEvent,
				checklist: [],
			});

			const record = await openHighLevelOverlay("s1", subject);

			expect(record?.verdict).toBe(verdict);
			expect(mockAwaitPreviewApproval).toHaveBeenCalledOnce();
			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(log).toHaveBeenCalledWith("Nothing was posted to GitHub.");
		},
	);

	it("keeps the saved record, prints the gh error and exits non-zero when the review fails", async () => {
		mockAwaitPreviewApproval.mockResolvedValue({
			decision: "approve",
			checklist: [],
		});
		mockExecFileSync.mockImplementation(() => {
			throw Object.assign(new Error("failed"), {
				stderr: "Can not approve your own pull request\n",
			});
		});

		await expect(openHighLevelOverlay("s1", subject)).rejects.toThrow("exit 1");

		expect(mockSaveHighLevelReview).toHaveBeenCalled();
		expect(error).toHaveBeenCalledWith(
			"Could not post the review to org/repo#42: Can not approve your own pull request",
		);
	});
});
