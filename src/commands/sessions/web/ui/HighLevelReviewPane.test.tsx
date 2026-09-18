// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HighLevelCheckResult } from "../../../review/highLevel/types";
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

function preview(overrides: Partial<PrPreview> = {}): PrPreview {
	return {
		requestId: "req-1",
		title: "High-level review of org/repo#42",
		body: JSON.stringify(checks),
		prNumber: 42,
		kind: "high-level-review",
		metadata: [{ label: "Changed files", value: "12" }],
		...overrides,
	};
}

afterEach(cleanup);

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
