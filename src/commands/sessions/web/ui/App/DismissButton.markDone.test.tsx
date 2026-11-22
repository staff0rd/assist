// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateItemStatus } from "../../../../backlog/web/ui/api";
import { DismissButton } from "./DismissButton";
import type { DismissBacklog } from "./DismissButton/useDismissMarkDone";

vi.mock("../../../../backlog/web/ui/api", () => ({
	updateItemStatus: vi.fn(),
}));
vi.mock("../clientFailures/reportCaughtError", () => ({
	reportCaughtError: vi.fn(),
}));

beforeEach(() => {
	vi.mocked(updateItemStatus).mockReset();
	vi.mocked(updateItemStatus).mockResolvedValue({} as never);
});
afterEach(cleanup);

const BACKLOG: DismissBacklog = {
	target: { itemId: 3, phase: 1, totalPhases: 2 },
	cwd: "/repo",
	node: "box",
};

function renderButton(backlog?: DismissBacklog) {
	const onDismiss = vi.fn();
	const onDismissAll = vi.fn();
	const onDismissChildren = vi.fn();
	render(
		<DismissButton
			id="7c1e"
			status="waiting"
			onDismiss={onDismiss}
			childDismiss={{ childCount: 1, onDismissAll, onDismissChildren }}
			backlog={backlog}
		/>,
	);
	return {
		onDismiss,
		onDismissAll,
		onDismissChildren,
		button: screen.getByRole("button"),
	};
}

describe("DismissButton Shift+Ctrl mark done", () => {
	it("adds the mark-done hint to a backlog card's tooltip", () => {
		const { button } = renderButton(BACKLOG);

		expect(button.title).toBe(
			"Dismiss session 7c1e (Shift skips confirmation, Shift+Ctrl also marks a3 done)",
		);
	});

	it("keeps the plain tooltip on a non-backlog card", () => {
		const { button } = renderButton();

		expect(button.title).toBe(
			"Dismiss session 7c1e (Shift skips confirmation)",
		);
	});

	it("marks the item done, then closes runs and children without asking", async () => {
		const { button, onDismiss, onDismissAll, onDismissChildren } =
			renderButton(BACKLOG);

		fireEvent.click(button, { shiftKey: true, ctrlKey: true });

		expect(updateItemStatus).toHaveBeenCalledWith(3, "done", "/repo", "box");
		await waitFor(() =>
			expect(onDismiss).toHaveBeenCalledWith({ closeServerRuns: true }),
		);
		expect(onDismissChildren).toHaveBeenCalledOnce();
		expect(onDismissAll).not.toHaveBeenCalled();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("acts like Shift+click on a non-backlog card", () => {
		const { button, onDismiss, onDismissAll } = renderButton();

		fireEvent.click(button, { shiftKey: true, ctrlKey: true });

		expect(updateItemStatus).not.toHaveBeenCalled();
		expect(onDismissAll).toHaveBeenCalledOnce();
		expect(onDismiss).not.toHaveBeenCalled();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("leaves Shift+click on a backlog card as a plain dismiss", () => {
		const { button, onDismissAll } = renderButton(BACKLOG);

		fireEvent.click(button, { shiftKey: true });

		expect(updateItemStatus).not.toHaveBeenCalled();
		expect(onDismissAll).toHaveBeenCalledOnce();
	});

	it("shows an error and keeps the card when marking done fails", async () => {
		vi.mocked(updateItemStatus).mockRejectedValue(new Error("boom"));
		const { button, onDismiss, onDismissAll, onDismissChildren } =
			renderButton(BACKLOG);

		fireEvent.click(button, { shiftKey: true, ctrlKey: true });

		expect(
			await screen.findByText("Failed to mark item a3 as done"),
		).toBeTruthy();
		expect(onDismiss).not.toHaveBeenCalled();
		expect(onDismissAll).not.toHaveBeenCalled();
		expect(onDismissChildren).not.toHaveBeenCalled();
	});
});
