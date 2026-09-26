// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { NewSessionButton } from "./NewSessionButton";

afterEach(cleanup);

function renderAt(path: string) {
	const router = createMemoryRouter(
		[{ path: "*", element: <NewSessionButton /> }],
		{ initialEntries: [path] },
	);
	render(<RouterProvider router={router} />);
	return router;
}

describe("NewSessionButton", () => {
	it("requests the new-session dialog, keeping the other params", () => {
		const router = renderAt("/sessions?keep=1");

		fireEvent.click(screen.getByRole("button", { name: "New session" }));

		const params = new URLSearchParams(router.state.location.search);
		expect(params.has("new")).toBe(true);
		expect(params.get("keep")).toBe("1");
		expect(router.state.location.pathname).toBe("/sessions");
		expect(router.state.historyAction).toBe("REPLACE");
	});

	it("shows the hotkeys as key chips in its tooltip", async () => {
		renderAt("/");

		await act(async () => {
			fireEvent.mouseOver(screen.getByRole("button", { name: "New session" }));
		});

		const tooltip = await screen.findByRole("tooltip");
		expect(tooltip.textContent).toContain("New session");
		expect(
			Array.from(tooltip.querySelectorAll("kbd")).map((k) => k.textContent),
		).toEqual(["Ctrl+N", "Alt+N"]);
	});
});
