// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { openTooltipChords } from "../../openTooltipChords";
import { shortcutRegistry } from "../../shortcutRegistry";
import { formatChord } from "../../formatChord";
import { NewSessionButton } from "./NewSessionButton";

let mac = false;
vi.mock("../../isMacPlatform", () => ({ isMacPlatform: () => mac }));

afterEach(() => {
	cleanup();
	mac = false;
});

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

	it("shows the registry's hotkeys as key chips in its tooltip", async () => {
		renderAt("/");

		const { text, chords } = await openTooltipChords(
			screen.getByRole("button", { name: "New session" }),
		);

		expect(text).toContain(shortcutRegistry.newSession.label);
		expect(chords).toEqual(
			shortcutRegistry.newSession.chords.map((chord) => formatChord(chord)),
		);
		expect(chords).toEqual(["Ctrl+N", "Alt+N"]);
	});

	it("shows macOS glyphs on a Mac", async () => {
		mac = true;
		renderAt("/");

		const { chords } = await openTooltipChords(
			screen.getByRole("button", { name: "New session" }),
			"focus",
		);

		expect(chords).toEqual(["⌃N", "⌥N"]);
	});
});
