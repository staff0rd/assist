// @vitest-environment jsdom
import Drawer from "@mui/material/Drawer";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PhoneBackButton } from "./PhoneBackButton";

const platform = vi.hoisted(() => ({ native: true }));
vi.mock("../isNativeApp", () => ({
	get isNativePlatform() {
		return platform.native;
	},
}));

afterEach(cleanup);
beforeEach(() => {
	platform.native = true;
});

function renderAt(to?: string, sheetOpen = false) {
	return render(
		<MemoryRouter initialEntries={["/history", "/session/1"]} initialIndex={1}>
			<Routes>
				<Route path="/" element={<div>root</div>} />
				<Route path="/history" element={<div>history</div>} />
				<Route
					path="/session/:id"
					element={
						<>
							<PhoneBackButton label="Sessions" to={to} />
							<Drawer anchor="bottom" open={sheetOpen}>
								sheet
							</Drawer>
						</>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

function swipe(fromX: number, toX: number, toY = 300) {
	fireEvent.touchStart(document, {
		touches: [{ clientX: fromX, clientY: 300 }],
	});
	fireEvent.touchMove(document, { touches: [{ clientX: toX, clientY: toY }] });
	fireEvent.touchEnd(document, { touches: [] });
}

function expectStayed() {
	expect(screen.queryByText("root")).toBeNull();
}

describe("PhoneBackButton", () => {
	it("is chevron-only, labelled with its destination", () => {
		renderAt("/");
		const button = screen.getByRole("button", { name: "Back to Sessions" });
		expect(button.textContent).toBe("");
		fireEvent.click(button);
		expect(screen.getByText("root")).toBeTruthy();
	});

	it("goes to its fixed target on an edge swipe", () => {
		renderAt("/");
		swipe(5, 150);
		expect(screen.getByText("root")).toBeTruthy();
	});

	it("goes back in history on an edge swipe without a target", () => {
		renderAt();
		swipe(5, 150);
		expect(screen.getByText("history")).toBeTruthy();
	});

	it("ignores a swipe shorter than the threshold", () => {
		renderAt("/");
		swipe(5, 40);
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});

	it("ignores a swipe starting away from the left edge", () => {
		renderAt("/");
		swipe(100, 300);
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});

	it("ignores edge swipes outside the native app", () => {
		platform.native = false;
		renderAt("/");
		swipe(5, 150);
		expectStayed();
	});

	it("ignores a mostly-vertical swipe from the edge", () => {
		renderAt("/");
		swipe(5, 100, 500);
		expectStayed();
	});

	it("ignores a multi-touch gesture from the edge", () => {
		renderAt("/");
		fireEvent.touchStart(document, {
			touches: [{ clientX: 5, clientY: 300 }],
		});
		fireEvent.touchStart(document, {
			touches: [
				{ clientX: 5, clientY: 300 },
				{ clientX: 200, clientY: 400 },
			],
		});
		fireEvent.touchMove(document, {
			touches: [
				{ clientX: 150, clientY: 300 },
				{ clientX: 300, clientY: 400 },
			],
		});
		fireEvent.touchEnd(document, { touches: [] });
		expectStayed();
	});

	it("ignores edge swipes while a bottom sheet is open", () => {
		renderAt("/", true);
		swipe(5, 150);
		expectStayed();
	});
});
