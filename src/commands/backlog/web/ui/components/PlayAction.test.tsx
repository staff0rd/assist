// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { LiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { SelectSessionContext } from "../useSelectSessionContext";
import { PlayAction } from "./PlayAction";

function LocationProbe() {
	const location = useLocation();
	return <div data-testid="location">{location.pathname}</div>;
}

function renderPlay(
	launchAssist: () => void,
	sessions: SessionInfo[] = [],
	{
		compact = false,
		selectSession = () => {},
	}: { compact?: boolean; selectSession?: (id: string) => void } = {},
) {
	return render(
		<MemoryRouter initialEntries={["/backlog"]}>
			<LiveSessionsContext.Provider value={sessions}>
				<SelectSessionContext.Provider value={selectSession}>
					<SessionLaunchContext.Provider
						value={{
							launchAssist,
							launchAgentInStream: () => {},
							resumeSession: () => {},
							armUpdateReload: () => {},
						}}
					>
						<PlayAction itemId={775} compact={compact} />
						<LocationProbe />
					</SessionLaunchContext.Provider>
				</SelectSessionContext.Provider>
			</LiveSessionsContext.Provider>
		</MemoryRouter>,
	);
}

const liveRun = makeSessionInfo({
	id: "4",
	commandType: "assist",
	status: "running",
	assistArgs: ["backlog", "run", "a775"],
});

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

	it("swaps Build for a link to the live run's session", () => {
		const launchAssist = vi.fn();
		const selectSession = vi.fn();
		renderPlay(launchAssist, [liveRun], { selectSession });

		expect(screen.queryByRole("button", { name: "Build" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Session 4" }));

		expect(selectSession).toHaveBeenCalledWith("4");
		expect(screen.getByTestId("location").textContent).toBe("/sessions");
		expect(launchAssist).not.toHaveBeenCalled();
	});

	it("brings Build back once the run has ended", () => {
		renderPlay(vi.fn(), [{ ...liveRun, status: "done" }]);

		expect(screen.getByRole("button", { name: "Build" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Session 4" })).toBeNull();
	});

	it("keeps the compact play button disabled while a run is live", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, [liveRun], { compact: true });

		const button = screen.getByRole("button", { name: "Build" });
		expect(button.hasAttribute("disabled")).toBe(true);
		expect(screen.queryByRole("button", { name: "Session 4" })).toBeNull();
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
