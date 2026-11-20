// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme as render } from "../../../../../../../test/renderWithTheme";
import { buildHighLevelStructure } from "../../../../../../review/highLevel/buildHighLevelStructure";
import type {
	HighLevelCheckResult,
	HighLevelFile,
	HighLevelPreviewPayload,
	HighLevelSlice,
} from "../../../../../../review/highLevel/types";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { HighLevelReviewPane } from "./HighLevelReviewPane";

function manual(
	id: Extract<HighLevelCheckResult, { kind: "manual" }>["id"],
	title: string,
): HighLevelCheckResult {
	return {
		id,
		kind: "manual",
		title,
		short: title,
		backing: title,
		status: "manual",
		reason: title,
	};
}

function deterministic(
	id: Extract<HighLevelCheckResult, { kind: "deterministic" }>["id"],
	status: "pass" | "fail",
	reason: string,
): HighLevelCheckResult {
	return { id, kind: "deterministic", title: id, backing: id, status, reason };
}

const checks: HighLevelCheckResult[] = [
	{
		id: "no-merge-conflicts",
		kind: "deterministic",
		title: "No merge conflicts",
		backing: "GitHub",
		status: "pass",
		reason: "mergeable",
	},
	manual("structure-sensible", "The structure of the change is sensible"),
	manual("critical-diffs-correct", "The critical-file diffs are correct"),
	manual("tests-worth-having", "The tests are worth having"),
	manual("manual-testing", "The change can be exercised by hand"),
];

function file(path: string): HighLevelFile {
	return {
		path,
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: `https://example.test/${path}`,
		patch: "@@ -1 +1 @@\n-old\n+new",
	};
}

function slice(title: string, hunks: string[]): HighLevelSlice {
	return {
		title,
		summary: `About ${title}.`,
		hunks,
		additions: 1,
		deletions: 1,
	};
}

const payload: HighLevelPreviewPayload = {
	repo: "org/repo",
	prNumber: 7,
	headSha: "abc1234",
	body: "",
	checks,
	structure: buildHighLevelStructure([
		file("src/a.ts"),
		file("schema.graphql"),
	]),
	criticalDiffs: [{ ...file("schema.graphql"), patch: "@@ -1 +1 @@\n-a\n+b" }],
	criticalPaths: ["**/*.graphql"],
	tests: [],
	testPaths: [],
	collapsedPaths: [],
	slices: [
		slice("Change a", ["src/a.ts#0"]),
		slice("Change schema", ["schema.graphql#0"]),
	],
	manualTesting: { setup: [], steps: [] },
};

function preview(extra: Partial<HighLevelPreviewPayload> = {}): PrPreview {
	return {
		requestId: "req-sliced",
		title: "org/repo#7 — Sliced",
		body: JSON.stringify({ ...payload, ...extra }),
		prNumber: 7,
		kind: "high-level-review",
	};
}

function rail() {
	return screen.getByRole("navigation", { name: "Slices" });
}

function railEntry(name: RegExp) {
	return within(rail()).getByRole("button", { name });
}

function area(name: RegExp) {
	return within(screen.getByRole("tablist", { name: "Areas" })).getByRole(
		"tab",
		{ name },
	);
}

afterEach(() => {
	cleanup();
});

describe("HighLevelSliceReview", () => {
	it("starts on Overview with its areas and lists each slice in the rail", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(railEntry(/Overview/).getAttribute("aria-current")).toBe("true");
		expect(railEntry(/1Change a/)).toBeTruthy();
		expect(railEntry(/2Change schema/)).toBeTruthy();
		expect(
			within(screen.getByRole("tablist", { name: "Areas" }))
				.getAllByRole("tab")
				.map((tab) => tab.textContent),
		).toEqual([
			"Description",
			"Checks1",
			"not tickedManual testing0",
			"All files2",
		]);
		expect(area(/Description/).getAttribute("aria-selected")).toBe("true");
	});

	it("renders the PR body as markdown on the Description tab", () => {
		render(
			<HighLevelReviewPane
				preview={preview({ body: "## What\n\nAdds **a thing**." })}
				onDecision={vi.fn()}
			/>,
		);

		expect(screen.getByRole("heading", { name: /^What/ })).toBeTruthy();
		expect(screen.getByText("a thing").tagName).toBe("STRONG");
		expect(
			screen.getByRole("link", { name: /View on GitHub/ }).getAttribute("href"),
		).toBe("https://github.com/org/repo/pull/7");
	});

	it("shows the description checks as chips and badges the tab on failure", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					body: "## What\nA.\n\n## Why\nB. Fixes #3.",
					checks: [
						...checks,
						deterministic("description-what-why", "pass", "both present"),
						deterministic(
							"description-word-cap",
							"fail",
							"412 words, 112 over",
						),
						deterministic("description-links-issue", "pass", "links #3"),
					],
				})}
				onDecision={vi.fn()}
			/>,
		);

		const chips = within(
			screen.getByRole("list", { name: "Description checks" }),
		).getAllByRole("listitem");
		expect(chips.map((chip) => chip.textContent)).toEqual([
			"passWhat & Why: both present",
			"failWord cap: 412 words, 112 over",
			"passLinked issue: links #3",
		]);
		expect(within(chips[1]).getByTitle("fail")).toBeTruthy();
		expect(area(/Description/).textContent).toBe("Description1 fail");
		expect(screen.getByText("#3").className).toBe("issue-ref");
	});

	it("shows No description for an empty body", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(screen.getByText("No description")).toBeTruthy();
	});

	it("lists the PRs linked in the description beneath the Related PRs tick", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					body: "Intro paragraph.\nPairs with org/web#12 and org/repo#7.",
					checks: [
						...checks,
						manual("related-prs-linked", "Related PRs are linked"),
					],
				})}
				onDecision={vi.fn()}
			/>,
		);

		fireEvent.click(area(/Related PRs/));

		expect(screen.getByLabelText("Related PRs are linked")).toBeTruthy();
		const link = screen.getByRole("link", { name: "org/web#12" });
		expect(link.getAttribute("href")).toBe(
			"https://github.com/org/web/pull/12",
		);
		expect(
			screen.getByText("Pairs with org/web#12 and org/repo#7."),
		).toBeTruthy();
		const list = screen.getByRole("list", {
			name: "Linked in the description",
		});
		expect(within(list).getAllByRole("link")).toHaveLength(1);
		expect(screen.queryByText("Intro paragraph.")).toBeNull();
		expect(screen.getByRole("link", { name: /View on GitHub/ })).toBeTruthy();
	});

	it("shows an empty state when the description links no other PRs", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					body: "Pairs with web change.",
					checks: [
						...checks,
						manual("related-prs-linked", "Related PRs are linked"),
					],
				})}
				onDecision={vi.fn()}
			/>,
		);

		fireEvent.click(area(/Related PRs/));

		expect(
			screen.getByText("The description links no other PRs."),
		).toBeTruthy();
		expect(screen.queryByText("Pairs with web change.")).toBeNull();
	});

	it("still shows the description when reopening saved progress", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					body: "Drafted body.",
					progress: { updatedAt: "now", items: [] },
				})}
				onDecision={vi.fn()}
			/>,
		);

		expect(screen.getByText("Drafted body.")).toBeTruthy();
	});

	it("shows the PR's total +/- on the Overview entry and header", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		expect(within(railEntry(/Overview/)).getByText("+2")).toBeTruthy();
		expect(screen.getByText(/^2 slices ·/)).toBeTruthy();
		expect(screen.getByText(/2 modified · \+2 −2/)).toBeTruthy();
	});

	it("disables Critical diffs for a slice with no critical file", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);

		fireEvent.click(railEntry(/1Change a/));

		expect(area(/Critical diffs/).hasAttribute("disabled")).toBe(true);
		expect(screen.getByText("About Change a.")).toBeTruthy();
		expect(screen.getByText("a.ts")).toBeTruthy();
		expect(screen.queryByText("schema.graphql")).toBeNull();
	});

	it("moves between slices with ] and [ keeping the area", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);
		fireEvent.click(railEntry(/1Change a/));
		fireEvent.keyDown(document, { key: "2" });
		expect(area(/Tests/).getAttribute("aria-selected")).toBe("true");

		fireEvent.keyDown(document, { key: "]" });

		expect(railEntry(/2Change schema/).getAttribute("aria-current")).toBe(
			"true",
		);
		expect(area(/Tests/).getAttribute("aria-selected")).toBe("true");
		fireEvent.keyDown(document, { key: "[" });
		expect(railEntry(/1Change a/).getAttribute("aria-current")).toBe("true");
	});

	it("jumps to a slice from its tag in All files", () => {
		render(<HighLevelReviewPane preview={preview()} onDecision={vi.fn()} />);
		fireEvent.click(area(/All files/));

		fireEvent.click(screen.getByRole("button", { name: "slice 2" }));

		expect(railEntry(/2Change schema/).getAttribute("aria-current")).toBe(
			"true",
		);
		expect(area(/Structure/).getAttribute("aria-selected")).toBe("true");
	});

	it("approves at any time, sending each slice's items", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		fireEvent.click(railEntry(/2Change schema/));
		fireEvent.click(area(/Tests/));
		fireEvent.click(screen.getAllByRole("checkbox")[0] as HTMLElement);
		fireEvent.click(screen.getByRole("button", { name: "Approve" }));

		const [, details] = onDecision.mock.calls[0] ?? [];
		const { checklist } = details as {
			checklist: { id: string; slice?: number; ticked: boolean }[];
		};
		expect(checklist).toContainEqual({
			id: "critical-diffs-correct",
			slice: 1,
			ticked: true,
		});
		expect(checklist).toContainEqual({
			id: "tests-worth-having",
			slice: 2,
			ticked: true,
		});
	});

	it("starts fresh only after confirming, sending a restart decision", () => {
		const onDecision = vi.fn();
		render(<HighLevelReviewPane preview={preview()} onDecision={onDecision} />);

		fireEvent.click(screen.getByRole("button", { name: "Start fresh" }));
		expect(onDecision).not.toHaveBeenCalled();
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Start fresh",
			}),
		);

		expect(onDecision).toHaveBeenCalledWith(
			"reject",
			expect.objectContaining({ dismissed: true, restart: true }),
		);
	});

	it("restores a slice's tick and comment from saved progress", () => {
		render(
			<HighLevelReviewPane
				preview={preview({
					progress: {
						updatedAt: "now",
						items: [
							{
								id: "structure-sensible",
								ticked: true,
								comment: "split it",
								slice: 2,
							},
						],
					},
				})}
				onDecision={vi.fn()}
			/>,
		);

		fireEvent.click(railEntry(/2Change schema/));

		expect(
			(
				screen.getByLabelText(
					"The structure of the change is sensible",
				) as HTMLInputElement
			).checked,
		).toBe(true);
		expect(screen.getByDisplayValue("split it")).toBeTruthy();
		fireEvent.click(railEntry(/1Change a/));
		expect(
			(
				screen.getByLabelText(
					"The structure of the change is sensible",
				) as HTMLInputElement
			).checked,
		).toBe(false);
	});
});
