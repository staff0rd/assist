// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../../../../../../prList";
import { reviewButtonModes } from "../../../reviewButtonModes";
import { ReviewTypeDialog } from "./ReviewTypeDialog";

const pr: PrSummary = {
	number: 42,
	title: "Add a thing",
	author: "someone",
	createdAt: new Date(0).toISOString(),
	url: "https://github.com/org/repo/pull/42",
};

function checkbox(label: string): HTMLInputElement {
	return screen.getByLabelText(label) as HTMLInputElement;
}

afterEach(cleanup);

describe("ReviewTypeDialog", () => {
	it("defaults every option toggle off", () => {
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		expect(checkbox("Force re-run").checked).toBe(false);
		expect(checkbox("Address comments after").checked).toBe(false);
		expect(checkbox("Announce to Slack after").checked).toBe(false);
	});

	it("defaults the option toggles off again when the dialog is reopened", () => {
		const { unmount } = render(
			<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />,
		);
		fireEvent.click(checkbox("Force re-run"));
		unmount();

		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		expect(checkbox("Force re-run").checked).toBe(false);
	});

	it("omits the force re-run mode entry", () => {
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.queryByText("Review (force re-run)")).toBeNull();
	});

	it.each(reviewButtonModes)(
		"selects $label unchanged by default",
		({ label, args }) => {
			const onSelect = vi.fn();
			render(
				<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />,
			);

			fireEvent.click(screen.getByText(label));

			expect(onSelect).toHaveBeenCalledWith(args);
		},
	);

	it.each(reviewButtonModes)(
		"appends the enabled option flags to $label",
		({ label, args }) => {
			const onSelect = vi.fn();
			render(
				<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />,
			);

			fireEvent.click(checkbox("Force re-run"));
			fireEvent.click(checkbox("Address comments after"));
			fireEvent.click(checkbox("Announce to Slack after"));
			fireEvent.click(screen.getByText(label));

			expect(onSelect).toHaveBeenCalledWith([
				...args,
				"--force",
				"--address-comments",
				"--announce",
			]);
		},
	);

	it.each(reviewButtonModes)(
		"forces a re-run of $label on its own",
		({ label, args }) => {
			const onSelect = vi.fn();
			render(
				<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />,
			);

			fireEvent.click(checkbox("Force re-run"));
			fireEvent.click(screen.getByText(label));

			expect(onSelect).toHaveBeenCalledWith([...args, "--force"]);
		},
	);

	it("selects Checkout with no option flags", () => {
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Checkout"));

		expect(onSelect).toHaveBeenCalledWith(["review", "--checkout-only"]);
	});

	it("selects Address Comments with no option flags", () => {
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Address Comments"));

		expect(onSelect).toHaveBeenCalledWith(["review-pr-comments"]);
	});

	it("selects Fix conflicts (merge) with no option flags", () => {
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Fix conflicts (merge)"));

		expect(onSelect).toHaveBeenCalledWith(["fix-conflict"]);
	});

	it("selects Fix conflicts (rebase) with no option flags", () => {
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(checkbox("Announce to Slack after"));
		fireEvent.click(screen.getByText("Fix conflicts (rebase)"));

		expect(onSelect).toHaveBeenCalledWith(["fix-conflict", "--rebase"]);
	});

	it("lists both fix-conflict items after Address Comments, below Checkout", () => {
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		const items = screen
			.getAllByRole("menuitem")
			.map((item) => item.textContent);

		expect(items.at(-1)).toBe("Fix conflicts (rebase)");
		expect(items.at(-2)).toBe("Fix conflicts (merge)");
		expect(items.at(-3)).toBe("Address Comments");
		expect(items.at(-4)).toBe("Checkout");
	});
});
