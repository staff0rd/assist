// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DismissButton } from "./DismissButton";

afterEach(cleanup);

const TITLE = "Dismiss session 54 (Shift skips confirmation)";

function renderButton(status: "done" | "waiting", withChildren: boolean) {
	const onDismiss = vi.fn();
	const onDismissAll = vi.fn();
	render(
		<DismissButton
			id="54"
			status={status}
			onDismiss={onDismiss}
			childDismiss={withChildren ? { childCount: 2, onDismissAll } : undefined}
		/>,
	);
	return { onDismiss, onDismissAll };
}

function renderParent(status: "done" | "waiting" = "done") {
	const handlers = renderButton(status, true);
	fireEvent.click(screen.getByTitle(TITLE));
	return handlers;
}

describe("DismissButton", () => {
	it("names the session id and the Shift shortcut in its tooltip", () => {
		render(<DismissButton id="54" status="waiting" onDismiss={() => {}} />);

		expect(screen.getByRole("button").title).toBe(TITLE);
	});

	it("dismisses a done childless session without asking", () => {
		const { onDismiss } = renderButton("done", false);

		fireEvent.click(screen.getByTitle(TITLE));

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("asks before ending a running childless session", () => {
		const { onDismiss } = renderButton("waiting", false);

		fireEvent.click(screen.getByTitle(TITLE));

		expect(onDismiss).not.toHaveBeenCalled();
		expect(screen.queryByText("Close this only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "End session" }));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("ends a running childless session on Shift+click without asking", () => {
		const { onDismiss } = renderButton("waiting", false);

		fireEvent.click(screen.getByTitle(TITLE), { shiftKey: true });

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("ends a running childless session on Shift+Enter without asking", () => {
		const { onDismiss } = renderButton("waiting", false);

		fireEvent.keyDown(screen.getByTitle(TITLE), {
			key: "Enter",
			shiftKey: true,
		});

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("closes the parent and its children on Shift+click without asking", () => {
		const { onDismiss, onDismissAll } = renderButton("waiting", true);

		fireEvent.click(screen.getByTitle(TITLE), { shiftKey: true });

		expect(onDismissAll).toHaveBeenCalledOnce();
		expect(onDismiss).not.toHaveBeenCalled();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("closes the parent and its children on Shift+Enter without asking", () => {
		const { onDismiss, onDismissAll } = renderButton("done", true);

		fireEvent.keyDown(screen.getByTitle(TITLE), {
			key: "Enter",
			shiftKey: true,
		});

		expect(onDismissAll).toHaveBeenCalledOnce();
		expect(onDismiss).not.toHaveBeenCalled();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("asks about nested sessions even when the parent is done", () => {
		const { onDismiss, onDismissAll } = renderParent("done");

		expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Close this only" }),
		).toBeTruthy();
		expect(screen.getByRole("button", { name: "Close all 3" })).toBeTruthy();
		expect(onDismiss).not.toHaveBeenCalled();
		expect(onDismissAll).not.toHaveBeenCalled();
	});

	it("closes only the parent on Close this only", () => {
		const { onDismiss, onDismissAll } = renderParent("waiting");

		fireEvent.click(screen.getByRole("button", { name: "Close this only" }));

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(onDismissAll).not.toHaveBeenCalled();
	});

	it("closes the parent and its children on Close all", () => {
		const { onDismiss, onDismissAll } = renderParent();

		fireEvent.click(screen.getByRole("button", { name: "Close all 3" }));

		expect(onDismissAll).toHaveBeenCalledOnce();
		expect(onDismiss).not.toHaveBeenCalled();
	});

	it("closes nothing on Cancel", () => {
		const { onDismiss, onDismissAll } = renderParent();

		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onDismiss).not.toHaveBeenCalled();
		expect(onDismissAll).not.toHaveBeenCalled();
	});
});
