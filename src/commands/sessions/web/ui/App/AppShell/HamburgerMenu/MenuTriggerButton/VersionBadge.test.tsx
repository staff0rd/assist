// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../../../../../test/renderWithTheme";
import { defaultHotkeys } from "../../../../../../../../shared/hotkeys/defaultHotkeys";
import { hotkeyBindingsStore } from "../../../hotkeyBindingsStore";
import { VersionBadge } from "./VersionBadge";

function renderBadge() {
	return renderWithTheme(
		<MemoryRouter initialEntries={["/sessions"]}>
			<VersionBadge />
			<Routes>
				<Route path="/nodes" element={<div>nodes page</div>} />
				<Route path="/sessions" element={<div>sessions page</div>} />
			</Routes>
		</MemoryRouter>,
	);
}

afterEach(cleanup);

describe("VersionBadge", () => {
	it("navigates to the nodes page on Alt+Q", () => {
		renderBadge();

		fireEvent.keyDown(document.body, { code: "KeyQ", altKey: true });

		expect(screen.getByText("nodes page")).toBeTruthy();
	});

	it("follows a remapped nodes chord", () => {
		renderBadge();
		act(() =>
			hotkeyBindingsStore.set({
				...defaultHotkeys,
				openUpdates: ["Ctrl+Alt+U"],
			}),
		);

		try {
			fireEvent.keyDown(document.body, { code: "KeyQ", altKey: true });
			expect(screen.queryByText("nodes page")).toBeNull();

			fireEvent.keyDown(document.body, {
				code: "KeyU",
				ctrlKey: true,
				altKey: true,
			});
			expect(screen.getByText("nodes page")).toBeTruthy();
		} finally {
			hotkeyBindingsStore.set(defaultHotkeys);
		}
	});
});
