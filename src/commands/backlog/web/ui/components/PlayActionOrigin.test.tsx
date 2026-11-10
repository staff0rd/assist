// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { RepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { PlayAction } from "./PlayAction";

const origins: Record<string, string> = {
	"/home/u/apm": "github.com/x/apm",
	"/home/u/assist": "github.com/x/assist",
};

function renderPlay(launchAssist: () => void, origin: string) {
	return render(
		<MemoryRouter>
			<LiveSessionsContext.Provider value={[]}>
				<RepoSelectionContext.Provider
					value={{
						repos: Object.keys(origins),
						selectedCwd: "/home/u/apm",
						worktreeCwd: "",
						setSelectedCwd: () => {},
						cloneOn: (cwd) => (origins[cwd] ? cwd : undefined),
						originOf: (cwd) => origins[cwd],
					}}
				>
					<SessionLaunchContext.Provider
						value={{
							launchAssist,
							launchAgentInStream: () => {},
							resumeSession: () => {},
							armUpdateReload: () => {},
							activateSession: () => {},
							sendInput: () => {},
						}}
					>
						<PlayAction itemId={775} origin={origin} />
					</SessionLaunchContext.Provider>
				</RepoSelectionContext.Provider>
			</LiveSessionsContext.Provider>
		</MemoryRouter>,
	);
}

beforeEach(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => Response.json({ cloneTarget: "/home/u/notes" })),
	);
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("PlayAction origin", () => {
	it("starts in the item's repo when another repo is selected", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, "github.com/X/Assist");

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775"],
			"/home/u/assist",
		);
	});

	it("starts in the selected repo when it is the item's repo", () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, "github.com/x/apm");

		fireEvent.click(screen.getByRole("button", { name: "Build" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "run", "a775"],
			"/home/u/apm",
		);
	});

	it("offers to clone the item's repo when it has no clone", async () => {
		const launchAssist = vi.fn();
		renderPlay(launchAssist, "github.com/x/notes");

		expect(await screen.findByRole("button", { name: "Clone" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Build" })).toBeNull();
		expect(launchAssist).not.toHaveBeenCalled();
	});
});
