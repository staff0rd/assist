// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HistoryList } from "./HistoryList";
import type { HistoricalSession } from "../../../../../../../types";
import { RepoSelectionContext } from "../../../../../../../useRepoSelectionContext";

afterEach(() => {
	cleanup();
});

const group = { origin: "host/org/assist", clone: "/git/assist" };

function session(
	name: string,
	cwd: string,
	repoGroup?: HistoricalSession["repoGroup"],
): HistoricalSession {
	return {
		sessionId: `sid-${name}`,
		name,
		project: cwd.split("/").pop() ?? cwd,
		cwd,
		timestamp: new Date(0).toISOString(),
		repoGroup,
	};
}

function renderList(sessions: HistoricalSession[], selectedCwd: string) {
	render(
		<RepoSelectionContext.Provider
			value={{
				repos: [],
				selectedCwd,
				worktreeCwd: selectedCwd,
				setSelectedCwd: vi.fn(),
			}}
		>
			<HistoryList sessions={sessions} onView={vi.fn()} onResume={vi.fn()} />
		</RepoSelectionContext.Provider>,
	);
}

describe("HistoryList", () => {
	it("lists a clone's worktree sessions under the clone entry", () => {
		renderList(
			[
				session("in clone", "/git/assist", group),
				session("in worktree", "/git/assist-2", group),
			],
			"/git/assist",
		);

		expect(screen.getByText("in clone")).toBeTruthy();
		expect(screen.getByText("in worktree")).toBeTruthy();
	});

	it("excludes sessions from another repo sharing a directory name", () => {
		renderList(
			[
				session("mine", "/git/assist", group),
				session("theirs", "/other/assist", {
					origin: "host/org/other",
					clone: "/other/assist",
				}),
			],
			"/git/assist",
		);

		expect(screen.getByText("mine")).toBeTruthy();
		expect(screen.queryByText("theirs")).toBeNull();
	});

	it("keeps a stale-origin session under the clone it shares", () => {
		renderList(
			[
				session("live", "/git/apm", {
					origin: "host/org/apm",
					clone: "/git/apm",
				}),
				session("reaped", "/git/apm-2", {
					origin: "local:/git/apm",
					clone: "/git/apm",
				}),
			],
			"/git/apm",
		);

		expect(screen.getByText("live")).toBeTruthy();
		expect(screen.getByText("reaped")).toBeTruthy();
	});

	it("falls back to the cwd for sessions with no resolved group", () => {
		renderList(
			[session("ungrouped", "/git/plain"), session("elsewhere", "/git/other")],
			"/git/plain",
		);

		expect(screen.getByText("ungrouped")).toBeTruthy();
		expect(screen.queryByText("elsewhere")).toBeNull();
	});
});
