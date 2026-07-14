// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { RefineAction } from "./RefineAction";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderRefine(launchAssist: () => void) {
	return render(
		<MemoryRouter initialEntries={["/backlog/items/279"]}>
			<SessionLaunchContext.Provider value={{ launchAssist }}>
				<RefineAction itemId={279} />
				<LocationProbe />
			</SessionLaunchContext.Provider>
		</MemoryRouter>,
	);
}

function mockHarness(exposeCodexActions: boolean) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ exposeCodexActions }),
		}),
	);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("RefineAction", () => {
	beforeEach(() => {
		mockHarness(false);
	});

	it("launches a refine session and navigates to /sessions", () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Refine" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "a279"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("does not spawn a second session on double-click (latched)", () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		const button = screen.getByRole("button", { name: "Refine" });
		fireEvent.click(button);
		fireEvent.click(button);

		expect(launchAssist).toHaveBeenCalledTimes(1);
	});

	it("hides the codex dropdown when codex actions are not exposed", () => {
		renderRefine(vi.fn());

		expect(
			screen.queryByRole("button", {
				name: "Refine with a different harness",
			}),
		).toBeNull();
	});
});

describe("RefineAction with codex exposed", () => {
	beforeEach(() => {
		mockHarness(true);
	});

	it("launches refine under codex from the dropdown", async () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		const toggle = await screen.findByRole("button", {
			name: "Refine with a different harness",
		});
		fireEvent.click(toggle);
		fireEvent.click(screen.getByRole("menuitem", { name: "with Codex" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "codex", "a279"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});
});
