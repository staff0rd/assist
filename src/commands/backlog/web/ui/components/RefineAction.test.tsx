// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(cleanup);

describe("RefineAction", () => {
	it("launches a refine session and navigates to /sessions", () => {
		const launchAssist = vi.fn();
		renderRefine(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Refine" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["refine", "--once", "279"],
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
});
