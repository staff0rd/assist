// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme as render } from "../../../../../../../test/renderWithTheme";
import type {
	HighLevelCheckResult,
	HighLevelPreviewPayload,
} from "../../../../../../review/highLevel/types";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
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
		short: "Structure",
		backing: "The changed-file tree",
		status: "manual",
		reason: "The changed-file tree",
	},
];

const payload: HighLevelPreviewPayload = {
	repo: "org/repo",
	prNumber: 42,
	headSha: "abc1234",
	body: "",
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
	tests: [
		{
			path: "src/app.test.ts",
			status: "modified",
			additions: 4,
			deletions: 0,
			diffUrl: "https://github.com/org/repo/pull/42/files#diff-ghi",
			tests: [
				{
					kind: "describe",
					name: "app",
					line: 3,
					children: [
						{
							kind: "it",
							id: "src/app.test.ts:4",
							name: "starts",
							line: 4,
							source: 'it("starts", () => {\n\texpect(start()).toBe(true);\n})',
						},
					],
				},
			],
		},
	],
	testPaths: ["**/*.test.ts"],
	collapsedPaths: [],
};

const testsCheck: HighLevelCheckResult = {
	id: "tests-worth-having",
	kind: "manual",
	title: "The tests are worth having",
	short: "Tests",
	backing: "The describe/it hierarchy of changed tests",
	status: "manual",
	reason: "The describe/it hierarchy of changed tests",
};

function withTestsCheck(extra: Partial<HighLevelPreviewPayload> = {}) {
	return preview({
		body: JSON.stringify({
			...payload,
			checks: [...checks, testsCheck],
			...extra,
		}),
	});
}

function preview(overrides: Partial<PrPreview> = {}): PrPreview {
	return {
		requestId: "req-1",
		title: "org/repo#42 — Native diff viewer in high-level review",
		body: JSON.stringify(payload),
		prNumber: 42,
		kind: "high-level-review",
		metadata: [{ label: "Branch", value: "feat/diff-viewer" }],
		...overrides,
	};
}

afterEach(() => {
	cleanup();
	localStorage.clear();
});

describe("HighLevelReviewPane", () => {
	it("heads the pane with the PR's own title beside a link to it", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(
			screen.getByText(/Native diff viewer in high-level review/),
		).toBeTruthy();
		expect(screen.getByText("org/repo#42").getAttribute("href")).toBe(
			"https://github.com/org/repo/issues/42",
		);
	});

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

	it("allows Approve while manual items are unticked", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		expect(screen.getByText(/1 manual item left to tick/)).toBeTruthy();
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		expect(onDecision).toHaveBeenCalledWith("approve", expect.anything());
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

	it.each([
		["Approve", "approve", "APPROVE"],
		["Comment", "approve", "COMMENT"],
		["Request changes", "reject", "REQUEST_CHANGES"],
	])(
		"carries the %s footer button's review event in the decision",
		(name, decision, reviewEvent) => {
			const onDecision = vi.fn();
			render(
				<HighLevelReviewPane preview={preview()} onDecision={onDecision} />,
			);

			fireEvent.click(screen.getByRole("button", { name }));

			expect(onDecision).toHaveBeenCalledWith(
				decision,
				expect.objectContaining({ reviewEvent, reviewComments: [] }),
			);
		},
	);

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

	it("closes without a verdict from a Close button left of Request changes", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		const buttons = screen
			.getAllByRole("button")
			.map((button) => button.textContent);
		expect(buttons.indexOf("Close")).toBe(
			buttons.indexOf("Request changes") - 1,
		);

		fireEvent.click(
			screen.getByLabelText("The structure of the change is sensible"),
		);
		fireEvent.click(screen.getByRole("button", { name: "Close" }));

		expect(onDecision).toHaveBeenCalledOnce();
		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ dismissed: true }),
		);
	});

	it("backs the structure item with the changed-file tree and diff links", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.getByText("Changed files (1)")).toBeTruthy();
		expect(screen.getByText("src")).toBeTruthy();
		expect(screen.getByText("app.ts")).toBeTruthy();
	});

	it("counts changed files in the narrow jump strip, not the metadata line", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		const strip = screen.getByRole("navigation", { name: "Judge" });
		expect(within(strip).getByText("(1)")).toBeTruthy();
		expect(screen.getByText("feat/diff-viewer")).toBeTruthy();
		expect(screen.queryByText("Changed files")).toBeNull();
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

	it("shows a file's diff inline in the native viewer with a link to GitHub", () => {
		const { container } = render(
			<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />,
		);

		expect(
			screen
				.getByRole("button", { name: "Collapse src/app.ts" })
				.getAttribute("aria-expanded"),
		).toBe("true");
		expect(container.querySelector("table.diff")).not.toBeNull();
		expect(
			screen.getByLabelText("Open src/app.ts on GitHub").getAttribute("href"),
		).toBe("https://github.com/org/repo/pull/42/files#diff-abc");
	});

	it("backs the critical-diff item with the full patch", () => {
		const criticalCheck: HighLevelCheckResult = {
			id: "critical-diffs-correct",
			kind: "manual",
			title: "The critical-file diffs are correct",
			short: "Critical diffs",
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

		fireEvent.click(
			screen.getByRole("button", { name: "Collapse schema.graphql" }),
		);
		expect(container.textContent).not.toContain("type New");
		fireEvent.click(
			screen.getByRole("button", { name: "Expand schema.graphql" }),
		);
		expect(container.textContent).toContain("type New");
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

	it("backs the tests item with the hierarchy, revealing a test's source only on click", () => {
		const { container } = render(
			<HighLevelReviewPane preview={withTestsCheck()} onDecision={vi.fn()} />,
		);

		expect(screen.getByText("Changed tests (1)")).toBeTruthy();
		expect(screen.getByText("app")).toBeTruthy();
		expect(screen.getByText("starts")).toBeTruthy();
		expect(container.textContent).not.toContain("expect(start())");

		fireEvent.click(screen.getByLabelText("Show the source of starts"));

		expect(container.textContent).toContain("expect(start()).toBe(true)");
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
