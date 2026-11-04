// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateItemStatus } from "../../../../../../backlog/web/ui/api";
import type { ChildDismiss } from "../../../types";
import { CompleteButton } from "./CompleteButton";

vi.mock("../../../../../../backlog/web/ui/api", () => ({
	updateItemStatus: vi.fn(),
}));
vi.mock("../../../clientFailures/reportCaughtError", () => ({
	reportCaughtError: vi.fn(),
}));

beforeEach(() => {
	vi.mocked(updateItemStatus).mockReset();
	vi.mocked(updateItemStatus).mockResolvedValue({} as never);
});
afterEach(cleanup);

function renderButton(onDismiss = vi.fn(), childDismiss?: ChildDismiss) {
	render(
		<CompleteButton
			target={{ itemId: 42, phase: 1, totalPhases: 1 }}
			cwd="/repo"
			onDismiss={onDismiss}
			childDismiss={childDismiss}
		/>,
	);
	return { onDismiss, button: screen.getByRole("button", { name: /done/i }) };
}

function renderWithChildren(childCount = 2) {
	const childDismiss = {
		childCount,
		onDismissAll: vi.fn(),
		onDismissChildren: vi.fn(),
	};
	return { ...renderButton(vi.fn(), childDismiss), childDismiss };
}

describe("CompleteButton with nested sessions", () => {
	it("closes the parent and nested sessions on Shift+click", async () => {
		const { button, onDismiss, childDismiss } = renderWithChildren();

		fireEvent.click(button, { shiftKey: true });

		await waitFor(() =>
			expect(childDismiss.onDismissChildren).toHaveBeenCalledOnce(),
		);
		expect(onDismiss).toHaveBeenCalledWith({ closeServerRuns: true });
		expect(childDismiss.onDismissAll).not.toHaveBeenCalled();
	});

	it("closes the parent and nested sessions on confirm", async () => {
		const { button, onDismiss, childDismiss } = renderWithChildren();

		fireEvent.click(button);
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Mark done",
			}),
		);

		await waitFor(() =>
			expect(childDismiss.onDismissChildren).toHaveBeenCalledOnce(),
		);
		expect(onDismiss).toHaveBeenCalledWith({ closeServerRuns: true });
	});

	it("names the nested session count in the confirm message", () => {
		const { button } = renderWithChildren(2);

		fireEvent.click(button);

		expect(
			screen.getByText(/Its 2 nested sessions will also be closed\./),
		).toBeTruthy();
	});

	it("does not close nested sessions when marking done fails", async () => {
		vi.mocked(updateItemStatus).mockRejectedValue(new Error("boom"));
		const { button, childDismiss } = renderWithChildren();

		fireEvent.click(button, { shiftKey: true });

		await screen.findByText("Failed to mark item a42 as done");
		expect(childDismiss.onDismissChildren).not.toHaveBeenCalled();
	});
});

describe("CompleteButton without nested sessions", () => {
	it("closes only the parent on confirm", async () => {
		const { button, onDismiss } = renderButton();

		fireEvent.click(button);
		expect(screen.queryByText(/nested/)).toBeNull();
		fireEvent.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Mark done",
			}),
		);

		await waitFor(() =>
			expect(onDismiss).toHaveBeenCalledWith({ closeServerRuns: true }),
		);
		expect(onDismiss).toHaveBeenCalledOnce();
	});
});

describe("CompleteButton", () => {
	it("focuses the Mark done button when the dialog opens", () => {
		const { button } = renderButton();

		fireEvent.click(button);

		expect(document.activeElement).toBe(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: "Mark done",
			}),
		);
		expect(updateItemStatus).not.toHaveBeenCalled();
	});

	it("opens the dialog on a plain Enter", () => {
		const { button } = renderButton();

		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.click(button);

		expect(screen.getByRole("dialog")).toBeTruthy();
		expect(updateItemStatus).not.toHaveBeenCalled();
	});

	it("mentions Shift in the button title", () => {
		const { button } = renderButton();

		expect(button.getAttribute("title")).toMatch(/shift/i);
	});

	it("marks done without the dialog on Shift+click", async () => {
		const { button, onDismiss } = renderButton();

		fireEvent.click(button, { shiftKey: true });

		await waitFor(() =>
			expect(onDismiss).toHaveBeenCalledWith({ closeServerRuns: true }),
		);
		expect(updateItemStatus).toHaveBeenCalledWith(
			42,
			"done",
			"/repo",
			undefined,
		);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("marks done without the dialog on Shift+Enter", async () => {
		const { button, onDismiss } = renderButton();

		fireEvent.keyDown(button, { key: "Enter", shiftKey: true });

		await waitFor(() => expect(onDismiss).toHaveBeenCalled());
		expect(updateItemStatus).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("shows the error snackbar when the skip path fails", async () => {
		vi.mocked(updateItemStatus).mockRejectedValue(new Error("boom"));
		const { button, onDismiss } = renderButton();

		fireEvent.click(button, { shiftKey: true });

		expect(
			await screen.findByText("Failed to mark item a42 as done"),
		).toBeTruthy();
		expect(onDismiss).not.toHaveBeenCalled();
	});
});
