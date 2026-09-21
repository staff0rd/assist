// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
	HighLevelCheckResult,
	HighLevelPreviewPayload,
} from "../../../review/highLevel/types";
import type { PrPreview } from "../../shared/SessionInfoBase";
import { HighLevelReviewPane } from "./HighLevelReviewPane";

const checks: HighLevelCheckResult[] = [
	{
		id: "description-what-why",
		kind: "deterministic",
		title: "Description has a What and a Why",
		backing: "The PR body",
		status: "fail",
		reason: "no `## Why` section",
	},
	{
		id: "description-word-cap",
		kind: "deterministic",
		title: "Description is under the word cap",
		backing: "The PR body's word count",
		status: "pass",
		reason: "120 of 300 words",
	},
	{
		id: "structure-sensible",
		kind: "manual",
		title: "The structure of the change is sensible",
		backing: "The changed-file tree",
		status: "manual",
		reason: "The changed-file tree",
	},
];

const payload: HighLevelPreviewPayload = {
	repo: "org/repo",
	prNumber: 42,
	checks,
	structure: {
		tree: [
			{
				kind: "dir",
				name: "src",
				path: "src",
				additions: 12,
				deletions: 3,
				children: [
					{
						kind: "file",
						name: "app.ts",
						path: "src/app.ts",
						status: "modified",
						additions: 12,
						deletions: 3,
						diffUrl: "https://github.com/org/repo/pull/42/files#diff-abc",
						patch: "@@ -1,2 +1,2 @@\n-was\n+now",
					},
				],
			},
		],
		added: 0,
		removed: 0,
		modified: 1,
		additions: 12,
		deletions: 3,
	},
	criticalDiffs: [
		{
			path: "schema.graphql",
			status: "modified",
			additions: 1,
			deletions: 1,
			diffUrl: "https://github.com/org/repo/pull/42/files#diff-def",
			patch: "@@ -1 +1 @@\n-type Old\n+type New",
		},
	],
	criticalPaths: ["**/*.graphql"],
};

function preview(overrides: Partial<PrPreview> = {}): PrPreview {
	return {
		requestId: "req-1",
		title: "High-level review of org/repo#42",
		body: JSON.stringify(payload),
		prNumber: 42,
		kind: "high-level-review",
		metadata: [{ label: "Changed files", value: "12" }],
		...overrides,
	};
}

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("HighLevelReviewPane", () => {
	it("lists every checklist item under its group", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.getByText("Evaluated for you")).toBeTruthy();
		expect(screen.getByText("Yours to judge")).toBeTruthy();
		for (const check of checks)
			expect(screen.getByText(check.title)).toBeTruthy();
	});

	it("shows a failed deterministic check with its reason", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.getByText("Fails: no `## Why` section")).toBeTruthy();
		expect(screen.getByText(/1 deterministic check failing/)).toBeTruthy();
	});

	it("holds Approve back until every manual item is ticked", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		const approve = screen.getByRole("button", { name: "Approve" });
		expect((approve as HTMLButtonElement).disabled).toBe(true);

		fireEvent.click(
			screen.getByLabelText("The structure of the change is sensible"),
		);

		expect((approve as HTMLButtonElement).disabled).toBe(false);
	});

	it("approves with every item's state and comment", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		fireEvent.change(
			screen.getByLabelText("Comment on Description has a What and a Why"),
			{ target: { value: "add a Why" } },
		);
		fireEvent.click(
			screen.getByLabelText("The structure of the change is sensible"),
		);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		expect(onDecision).toHaveBeenCalledWith(
			"approve",
			expect.objectContaining({
				checklist: [
					{
						id: "description-what-why",
						ticked: false,
						comment: "add a Why",
					},
					{ id: "description-word-cap", ticked: true },
					{ id: "structure-sensible", ticked: true },
				],
			}),
		);
	});

	it("requests changes without needing the manual items ticked", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		fireEvent.click(screen.getByRole("button", { name: "Request changes" }));

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({
				checklist: expect.arrayContaining([
					{ id: "structure-sensible", ticked: false },
				]),
			}),
		);
	});

	it("backs the structure item with the changed-file tree and diff links", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.getByText("Changed files (1)")).toBeTruthy();
		expect(screen.getByText("src")).toBeTruthy();
		expect(screen.getByText("app.ts")).toBeTruthy();
	});

	it("collapses a folder on click and remembers it for the same PR", () => {
		const { unmount } = render(
			<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />,
		);

		fireEvent.click(screen.getByLabelText("src"));
		expect(screen.queryByText("app.ts")).toBeNull();

		unmount();
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.queryByText("app.ts")).toBeNull();
		expect(screen.getByLabelText("src").getAttribute("aria-expanded")).toBe(
			"false",
		);
	});

	it("opens a file's diff in the native viewer with a link to GitHub", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		fireEvent.click(screen.getByLabelText("Show the diff of src/app.ts"));

		expect(screen.getByRole("dialog").textContent).toContain("src/app.ts");
		expect(
			screen.getByLabelText("Open src/app.ts on GitHub").getAttribute("href"),
		).toBe("https://github.com/org/repo/pull/42/files#diff-abc");
	});

	it("backs the critical-diff item with the full patch", () => {
		const criticalCheck: HighLevelCheckResult = {
			id: "critical-diffs-correct",
			kind: "manual",
			title: "The critical-file diffs are correct",
			backing: "Full diffs of the critical files",
			status: "manual",
			reason: "Full diffs of the critical files",
		};
		const { container } = render(
			<HighLevelReviewPane
				preview={preview({
					body: JSON.stringify({
						...payload,
						checks: [...checks, criticalCheck],
					}),
				})}
				onDecision={vi.fn()}
			/>,
		);

		expect(screen.getByText("Critical diffs (1)")).toBeTruthy();
		expect(screen.getByText("schema.graphql")).toBeTruthy();
		expect(container.textContent).toContain("type New");
		expect(container.textContent).toContain("type Old");
	});

	it("reopens a saved review with its ticks and comments", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					body: JSON.stringify({
						...payload,
						saved: {
							repo: "org/repo",
							prNumber: 42,
							headRef: "feat/thing",
							headSha: "abc123",
							verdict: "request-changes",
							reviewedAt: "2026-01-01T00:00:00.000Z",
							items: [
								{
									id: "structure-sensible",
									kind: "manual",
									title: "The structure of the change is sensible",
									status: "manual",
									reason: "tree",
									ticked: true,
									comment: "looked fine",
								},
							],
						},
					}),
				})}
				onDecision={vi.fn()}
			/>,
		);

		expect(
			(
				screen.getByLabelText(
					"The structure of the change is sensible",
				) as HTMLInputElement
			).checked,
		).toBe(true);
		expect(
			(
				screen.getByLabelText(
					"Comment on The structure of the change is sensible",
				) as HTMLTextAreaElement
			).value,
		).toBe("looked fine");
	});

	it("survives a body that is not a checklist", () => {
		render(
			<HighLevelReviewPane
				preview={preview({ body: "not json" })}
				onDecision={vi.fn()}
			/>,
		);

		expect(screen.getByText("Every item is accounted for")).toBeTruthy();
	});
});
