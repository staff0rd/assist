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

function mockHarness(capabilities: {
	exposeCodexActions?: boolean;
	exposePiActions?: boolean;
}) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({
			json: () => Promise.resolve(capabilities),
		}),
	);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("RefineAction", () => {
	beforeEach(() => {
		mockHarness({ exposeCodexActions: false, exposePiActions: false });
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

	it("hides the harness dropdown when no alternate harness is exposed", () => {
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
		mockHarness({ exposeCodexActions: true, exposePiActions: false });
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

	it("does not offer the pi menu item", async () => {
		renderRefine(vi.fn());

		const toggle = await screen.findByRole("button", {
			name: "Refine with a different harness",
		});
		fireEvent.click(toggle);

		expect(screen.queryByRole("menuitem", { name: "with pi" })).toBeNull();
	});
});

describe("RefineAction with pi exposed", () => {
	beforeEach(() => {
		mockHarness({ exposeCodexActions: false, exposePiActions: true });
	});

	it("launches refine under pi from the dropdown", async () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		const toggle = await screen.findByRole("button", {
			name: "Refine with a different harness",
		});
		fireEvent.click(toggle);
		fireEvent.click(screen.getByRole("menuitem", { name: "with pi" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "--harness", "pi", "a279"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
	});

	it("does not offer the codex menu item", async () => {
		renderRefine(vi.fn());

		const toggle = await screen.findByRole("button", {
			name: "Refine with a different harness",
		});
		fireEvent.click(toggle);

		expect(screen.queryByRole("menuitem", { name: "with Codex" })).toBeNull();
	});
});
