// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DismissButton } from "./DismissButton";

afterEach(cleanup);

function renderParent(status: "done" | "waiting" = "done") {
	const onDismiss = vi.fn();
	const onDismissAll = vi.fn();
	render(
		<DismissButton
			id="54"
			status={status}
			onDismiss={onDismiss}
			childDismiss={{ childCount: 2, onDismissAll }}
		/>,
	);
	fireEvent.click(screen.getByTitle("Dismiss session 54"));
	return { onDismiss, onDismissAll };
}

describe("DismissButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<DismissButton id="54" status="waiting" onDismiss={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Dismiss session 54");
	});

	it("dismisses a done childless session without asking", () => {
		const onDismiss = vi.fn();
		render(<DismissButton id="54" status="done" onDismiss={onDismiss} />);

		fireEvent.click(screen.getByTitle("Dismiss session 54"));

		expect(onDismiss).toHaveBeenCalledOnce();
		expect(screen.queryByRole("dialog")).toBeNull();
	});

	it("asks before ending a running childless session", () => {
		const onDismiss = vi.fn();
		render(<DismissButton id="54" status="waiting" onDismiss={onDismiss} />);

		fireEvent.click(screen.getByTitle("Dismiss session 54"));

		expect(onDismiss).not.toHaveBeenCalled();
		expect(screen.queryByText("Close this only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "End session" }));
		expect(onDismiss).toHaveBeenCalledOnce();
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
