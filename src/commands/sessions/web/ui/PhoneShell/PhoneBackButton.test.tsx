// @vitest-environment jsdom
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

function renderAt(to?: string) {
	return render(
		<MemoryRouter initialEntries={["/history", "/session/1"]} initialIndex={1}>
			<Routes>
				<Route path="/" element={<div>root</div>} />
				<Route path="/history" element={<div>history</div>} />
				<Route
					path="/session/:id"
					element={<PhoneBackButton label="Sessions" to={to} />}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

function swipe(fromX: number, toX: number) {
	fireEvent.touchStart(document, {
		touches: [{ clientX: fromX, clientY: 300 }],
	});
	fireEvent.touchMove(document, { touches: [{ clientX: toX, clientY: 300 }] });
	fireEvent.touchEnd(document, { touches: [] });
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
		expect(
			screen.getByRole("button", { name: "Back to Sessions" }),
		).toBeTruthy();
	});
});
