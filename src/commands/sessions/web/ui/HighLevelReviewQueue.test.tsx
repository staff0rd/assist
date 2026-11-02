// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
	HighLevelPreviewPayload,
	HighLevelReviewDraft,
	HighLevelReviewRecord,
} from "../../../review/highLevel/types";
import { makeSessionInfo } from "../../../../test/mothers/makeSessionInfo";
import type { PrPreview } from "../../shared/SessionInfoBase";
import type { SessionInfo } from "./types";
import { HighLevelReviewPane } from "./App/SessionContent/PrPreviewSlideInPane/HighLevelReviewPane";

vi.mock("./App/DiffCommentLayer/useDiffSelection", () => ({
	useDiffSelection: () => {
		const [pending, setPending] = useState<object | null>({
			quote: "starts",
			top: 0,
			left: 0,
			startLine: 4,
			endLine: 4,
			startSide: "RIGHT",
			side: "RIGHT",
			changes: [],
			moved: false,
			origin: null,
			rects: [],
		});
		return {
			wrapperRef: { current: null },
			contentRef: { current: null },
			pending,
			rects: null,
			onMouseDown: () => {},
			clear: () => setPending(null),
		};
	},
}));

const payload: HighLevelPreviewPayload = {
	repo: "org/repo",
	prNumber: 42,
	headSha: "abc1234",
	checks: [
		{
			id: "tests-worth-having",
			kind: "manual",
			title: "The tests are worth having",
			short: "Tests",
			backing: "The describe/it hierarchy of changed tests",
			status: "manual",
			reason: "The describe/it hierarchy of changed tests",
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
	tests: [
		{
			path: "src/app.test.ts",
			status: "modified",
			additions: 4,
			deletions: 0,
			diffUrl: "https://github.com/org/repo/pull/42/files#diff-ghi",
			tests: [
				{
					kind: "it",
					id: "src/app.test.ts:4",
					name: "starts",
					line: 4,
					source: 'it("starts", () => {});',
				},
			],
		},
	],
	testPaths: ["**/*.test.ts"],
	collapsedPaths: [],
};

const queued = {
	path: "src/app.test.ts",
	startLine: 4,
	endLine: 4,
	startSide: "RIGHT",
	side: "RIGHT",
	quote: "starts",
	note: "asserts nothing useful",
} as const;

const liveSession = makeSessionInfo({
	id: "daemon-1",
	name: "review-42",
	commandType: "claude",
	status: "running",
});

type Reopened = {
	saved?: HighLevelReviewRecord;
	draft?: HighLevelReviewDraft;
};

function preview({ saved, draft }: Reopened): PrPreview {
	return {
		requestId: "req-1",
		title: "org/repo#42 — A change",
		body: JSON.stringify({
			...payload,
			...(saved ? { saved } : {}),
			...(draft ? { draft } : {}),
		}),
		prNumber: 42,
		kind: "high-level-review",
	};
}

function renderPane({
	saved,
	draft,
	session = liveSession,
}: Reopened & { session?: SessionInfo } = {}) {
	const onDecision = vi.fn();
	const sendInput = vi.fn();
	render(
		<HighLevelReviewPane
			preview={preview({ saved, draft })}
			session={session}
			sendInput={sendInput}
			onDecision={onDecision}
		/>,
	);
	return { onDecision, sendInput };
}

function writeTestComment(note: string) {
	fireEvent.click(screen.getByLabelText("Show the source of starts"));
	fireEvent.change(screen.getByPlaceholderText("Add a note…"), {
		target: { value: note },
	});
}

function lastDecision(onDecision: ReturnType<typeof vi.fn>) {
	fireEvent.click(screen.getByRole("button", { name: "Comment" }));
	return onDecision.mock.calls.at(-1)?.[1];
}

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("high-level review queue", () => {
	it("queues a comment on a test's source, clears the box and lists it with a count", async () => {
		const { onDecision, sendInput } = renderPane();

		writeTestComment("asserts nothing useful");
		fireEvent.click(screen.getByRole("button", { name: "Add to review" }));

		await waitFor(() =>
			expect(screen.queryByPlaceholderText("Add a note…")).toBeNull(),
		);
		expect(screen.getByText("Queued for review (1)")).toBeTruthy();
		expect(screen.getByText("asserts nothing useful")).toBeTruthy();
		expect(sendInput).not.toHaveBeenCalled();
		expect(lastDecision(onDecision)).toMatchObject({
			reviewEvent: "COMMENT",
			reviewComments: [queued],
		});
	});

	it("sends a comment on a test's source to the agent instead of queueing it", async () => {
		const { onDecision, sendInput } = renderPane();

		writeTestComment("why this?");
		fireEvent.click(screen.getByRole("button", { name: "Send to agent" }));

		const [sessionId, data] = sendInput.mock.calls[0] as [string, string];
		expect(sessionId).toBe("daemon-1");
		expect(data).toContain("src/app.test.ts:4");
		expect(data).toContain("why this?");
		await waitFor(() =>
			expect(screen.queryByPlaceholderText("Add a note…")).toBeNull(),
		);
		expect(screen.queryByText(/Queued for review/)).toBeNull();
		expect(lastDecision(onDecision)).toMatchObject({ reviewComments: [] });
	});

	it("only offers Add to review once the session is no longer live", () => {
		const { sendInput } = renderPane({
			session: { ...liveSession, status: "stopped" },
		});

		writeTestComment("note");

		expect(
			screen.getByText(
				"Comments are unavailable — that session is no longer live.",
			),
		).toBeTruthy();
		expect(
			(
				screen.getByRole("button", {
					name: "Send to agent",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
		expect(
			(
				screen.getByRole("button", {
					name: "Add to review",
				}) as HTMLButtonElement
			).disabled,
		).toBe(false);
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("removes a queued comment", () => {
		const { onDecision } = renderPane();

		writeTestComment("asserts nothing useful");
		fireEvent.click(screen.getByRole("button", { name: "Add to review" }));
		fireEvent.click(
			screen.getByLabelText("Remove the queued comment on src/app.test.ts:4"),
		);

		expect(screen.queryByText(/Queued for review/)).toBeNull();
		expect(lastDecision(onDecision)).toMatchObject({ reviewComments: [] });
	});

	it("keeps a queued comment, ticks and check comments across a reload", () => {
		renderPane();
		writeTestComment("asserts nothing useful");
		fireEvent.click(screen.getByRole("button", { name: "Add to review" }));
		fireEvent.click(screen.getByLabelText("The tests are worth having"));
		fireEvent.change(
			screen.getByLabelText("Comment on The tests are worth having"),
			{ target: { value: "mostly fine" } },
		);
		cleanup();

		const { onDecision } = renderPane();

		expect(screen.getByText("Queued for review (1)")).toBeTruthy();
		expect(lastDecision(onDecision)).toMatchObject({
			checklist: [
				{ id: "tests-worth-having", ticked: true, comment: "mostly fine" },
			],
			reviewComments: [queued],
		});
	});

	it("keeps a removed queued comment removed across a reload", () => {
		renderPane();
		writeTestComment("asserts nothing useful");
		fireEvent.click(screen.getByRole("button", { name: "Add to review" }));
		fireEvent.click(
			screen.getByLabelText("Remove the queued comment on src/app.test.ts:4"),
		);
		cleanup();

		const { onDecision } = renderPane();

		expect(screen.queryByText(/Queued for review/)).toBeNull();
		expect(lastDecision(onDecision)).toMatchObject({ reviewComments: [] });
	});

	it("forgets the reload state once a verdict is given", () => {
		const first = renderPane();
		writeTestComment("asserts nothing useful");
		fireEvent.click(screen.getByRole("button", { name: "Add to review" }));
		lastDecision(first.onDecision);
		cleanup();

		renderPane();

		expect(screen.queryByText(/Queued for review/)).toBeNull();
	});

	it("restores the queue saved with the review", () => {
		const { onDecision } = renderPane({
			saved: {
				repo: "org/repo",
				prNumber: 42,
				headRef: "feat/thing",
				headSha: "abc123",
				verdict: "comment",
				reviewedAt: "2026-01-01T00:00:00.000Z",
				items: [],
				reviewComments: [queued],
			},
		});

		expect(screen.getByText("Queued for review (1)")).toBeTruthy();
		expect(lastDecision(onDecision)).toMatchObject({
			reviewComments: [queued],
		});
	});

	it("restores the queue and checklist left by a close without a verdict over the saved review", () => {
		const { onDecision } = renderPane({
			saved: {
				repo: "org/repo",
				prNumber: 42,
				headRef: "feat/thing",
				headSha: "abc123",
				verdict: "comment",
				reviewedAt: "2026-01-01T00:00:00.000Z",
				items: [],
			},
			draft: {
				repo: "org/repo",
				prNumber: 42,
				headRef: "feat/thing",
				headSha: "abc123",
				savedAt: "2026-01-02T00:00:00.000Z",
				items: [
					{
						id: "tests-worth-having",
						kind: "manual",
						title: "The tests are worth having",
						status: "manual",
						reason: "The describe/it hierarchy of changed tests",
						ticked: true,
						comment: "mostly fine",
					},
				],
				reviewComments: [queued],
			},
		});

		expect(screen.getByText("Queued for review (1)")).toBeTruthy();
		expect(lastDecision(onDecision)).toMatchObject({
			checklist: [
				{ id: "tests-worth-having", ticked: true, comment: "mostly fine" },
			],
			reviewComments: [queued],
		});
	});
});
