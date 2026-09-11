// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { LiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { PlayAction } from "./PlayAction";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderPlay(launchAssist: () => void, sessions: SessionInfo[] = []) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<LiveSessionsContext.Provider value={sessions}>
				<SessionLaunchContext.Provider
					value={{
						launchAssist,
						launchAgentInStream: () => {},
						resumeSession: () => {},
						armUpdateReload: () => {},
					}}
				>
					<PlayAction itemId={775} />
					<LocationProbe />
				</SessionLaunchContext.Provider>
			</LiveSessionsContext.Provider>
		</MemoryRouter>,
	);
}

const liveRun: SessionInfo = {
	id: "4",
	name: "assist backlog run a775",
	commandType: "assist",
	startedAt: 1,
	status: "running",
	assistArgs: ["backlog", "run", "a775"],
};

afterEach(cleanup);

describe("PlayAction", () => {
	it("launches a run for the item and stays on the backlog", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist);

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775"],
			undefined,
		);
		expect(screen.getByTestId("location").textContent).toBe("/backlog");
	});

	it("refuses to start a second run while one is live", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, [liveRun]);

		const button = screen.getByRole("button", { name: "Build" });
		expect(button.hasAttribute("disabled")).toBe(true);
		fireEvent.click(button);

		expect(launchAssist).not.toHaveBeenCalled();
	});

	it("stays available while another item is running", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, [
			{ ...liveRun, assistArgs: ["backlog", "run", "a772"] },
		]);

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(launchAssist).toHaveBeenCalledTimes(1);
	});
});
