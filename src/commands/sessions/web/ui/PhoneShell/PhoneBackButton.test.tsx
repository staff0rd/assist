// @vitest-environment jsdom
import Drawer from "@mui/material/Drawer";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneStackPageContext } from "./PhoneNavStack/usePhoneStackPage";

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

function Root() {
	const { state } = useLocation();
	return <div>{state?.phoneBack ? "root via back" : "root"}</div>;
}

function renderAt(beneath: boolean, sheetOpen = false, isCurrent = true) {
	const page = {
		isCurrent,
		beneath: beneath
			? { pathname: "/history", search: "", hash: "", state: null, key: "h" }
			: undefined,
		beneathLabel: beneath ? "History" : undefined,
	};
	return render(
		<MemoryRouter initialEntries={["/history", "/session/1"]} initialIndex={1}>
			<Routes>
				<Route path="/" element={<Root />} />
				<Route path="/history" element={<div>history</div>} />
				<Route
					path="/session/:id"
					element={
						<PhoneStackPageContext.Provider value={page}>
							<PhoneBackButton />
							<Drawer anchor="bottom" open={sheetOpen}>
								sheet
							</Drawer>
						</PhoneStackPageContext.Provider>
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
	expect(screen.queryByText("root via back")).toBeNull();
}

describe("PhoneBackButton", () => {
	it("is chevron-only, labelled with the page beneath, and pops to it", () => {
		renderAt(true);
		const button = screen.getByRole("button", { name: "Back to History" });
		expect(button.textContent).toBe("");
		fireEvent.click(button);
		expect(screen.getByText("history")).toBeTruthy();
	});

	it("replaces with the owning tab root when nothing is beneath", () => {
		renderAt(false);
		fireEvent.click(screen.getByRole("button", { name: "Back to Sessions" }));
		expect(screen.getByText("root via back")).toBeTruthy();
	});

	it("goes back on an edge swipe", () => {
		renderAt(true);
		swipe(5, 150);
		expect(screen.getByText("history")).toBeTruthy();
	});

	it("ignores edge swipes on a page that is not current", () => {
		renderAt(false, false, false);
		swipe(5, 150);
		expectStayed();
	});

	it("ignores a swipe shorter than the threshold", () => {
		renderAt(false);
		swipe(5, 40);
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});

	it("ignores a swipe starting away from the left edge", () => {
		renderAt(false);
		swipe(100, 300);
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});

	it("ignores edge swipes outside the native app", () => {
		platform.native = false;
		renderAt(false);
		swipe(5, 150);
		expectStayed();
	});

	it("ignores a mostly-vertical swipe from the edge", () => {
		renderAt(false);
		swipe(5, 100, 500);
		expectStayed();
	});

	it("ignores a multi-touch gesture from the edge", () => {
		renderAt(false);
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
		renderAt(false, true);
		swipe(5, 150);
		expectStayed();
	});
});
