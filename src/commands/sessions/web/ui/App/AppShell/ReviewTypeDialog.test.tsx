// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrSummary } from "../../../prList";
import { reviewButtonModes } from "../../../../../../shared/reviewButtonModes";
import { ReviewTypeDialog } from "./ReviewTypeDialog";

const pr: PrSummary = {
	number: 42,
	title: "Add a thing",
	author: "someone",
	createdAt: new Date(0).toISOString(),
	url: "https://github.com/org/repo/pull/42",
	isDraft: false,
};

function checkbox(label: string): HTMLInputElement {
	return screen.getByLabelText(label) as HTMLInputElement;
}

const unavailableOn = {
	available: false,
	reasons: [{ capability: "x", reason: "no", remediation: "y" }],
};

function stubCapabilities(features: Record<string, unknown>) {
	const fetch = vi.fn(async () =>
		Response.json({
			exposeCodexActions: true,
			exposePiActions: false,
			engine: "claude",
			features,
		}),
	);
	vi.stubGlobal("fetch", fetch);
	return fetch;
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

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

	it("selects Address Comments (auto) with no review option flags", () => {
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(checkbox("Force re-run"));
		fireEvent.click(screen.getByText("Address Comments (auto)"));

		expect(onSelect).toHaveBeenCalledWith(["review-pr-comments", "--auto"]);
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

	it("lists both fix-conflict items after the Address Comments items, below Checkout, then Open in GitHub", () => {
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		const items = screen
			.getAllByRole("menuitem")
			.map((item) => item.textContent);

		expect(items.at(-1)).toBe("Open in GitHub");
		expect(items.at(-2)).toBe("Fix conflicts (rebase)");
		expect(items.at(-3)).toBe("Fix conflicts (merge)");
		expect(items.at(-4)).toBe("Address Comments (auto)");
		expect(items.at(-5)).toBe("Address Comments");
		expect(items.at(-6)).toBe("Checkout");
	});

	it("opens the PR in GitHub and closes without starting a session", () => {
		const open = vi.spyOn(globalThis, "open").mockReturnValue(null);
		const onSelect = vi.fn();
		const onCancel = vi.fn();
		render(
			<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={onCancel} />,
		);

		fireEvent.click(screen.getByText("Open in GitHub"));

		expect(open).toHaveBeenCalledWith(pr.url, "_blank");
		expect(onCancel).toHaveBeenCalled();
		expect(onSelect).not.toHaveBeenCalled();
		open.mockRestore();
	});

	it("runs a row on the engine, or on another harness from its trailing button", async () => {
		stubCapabilities({
			reviewRefine: { claude: { available: true }, codex: { available: true } },
			reviewApply: { claude: { available: true }, codex: unavailableOn },
		});
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Run Review & refine on Codex",
			}),
		);
		expect(onSelect).toHaveBeenLastCalledWith([
			"review",
			"--refine",
			"--harness",
			"codex",
		]);
		expect(onSelect).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText("Review & refine"));
		expect(onSelect).toHaveBeenLastCalledWith(["review", "--refine"]);
		expect(
			screen.queryByRole("button", { name: "Run Review & apply on Codex" }),
		).toBeNull();
		expect(
			screen.queryByRole("button", { name: "Run Review on Codex" }),
		).toBeNull();
	});

	it("offers Codex on PR actions whose feature resolves on it", async () => {
		stubCapabilities({
			fixConflict: { claude: { available: true }, codex: { available: true } },
		});
		const onSelect = vi.fn();
		render(<ReviewTypeDialog pr={pr} onSelect={onSelect} onCancel={vi.fn()} />);

		fireEvent.click(
			await screen.findByRole("button", {
				name: "Run Fix conflicts (rebase) on Codex",
			}),
		);

		expect(onSelect).toHaveBeenCalledWith([
			"fix-conflict",
			"--rebase",
			"--harness",
			"codex",
		]);
		expect(
			screen.queryByRole("button", { name: "Run Checkout on Codex" }),
		).toBeNull();
	});

	it("shows no harness buttons when only the engine is available", async () => {
		const fetch = stubCapabilities({
			reviewRefine: { claude: { available: true }, codex: unavailableOn },
		});
		render(<ReviewTypeDialog pr={pr} onSelect={vi.fn()} onCancel={vi.fn()} />);

		await act(async () => {
			await fetch.mock.results[0]?.value;
		});

		expect(screen.queryByRole("button", { name: /^Run / })).toBeNull();
	});
});
