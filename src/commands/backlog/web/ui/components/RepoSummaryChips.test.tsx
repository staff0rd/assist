// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { RepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import { SessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import type { RepoSummary } from "../fetchRepoSummaries";

let summaries: RepoSummary[] = [];
vi.mock("../useRepoSummaries", () => ({
	useRepoSummaries: () => summaries,
}));

import { RepoSummaryChips } from "./RepoSummaryChips";

function session(overrides: Partial<SessionInfo>): SessionInfo {
	return {
		id: "s1",
		name: "assist backlog clone github.com/org/repo",
		commandType: "assist",
		startedAt: 1,
		status: "running",
		...overrides,
	} as SessionInfo;
}

function renderChips(
	sessions: SessionInfo[],
	launchAssist = vi.fn(),
	setSelectedCwd = vi.fn(),
) {
	const utils = render(
		<RepoSelectionContext.Provider
			value={{ repos: [], selectedCwd: "", setSelectedCwd }}
		>
			<SessionLaunchContext.Provider
				value={{ launchAssist, armUpdateReload: () => {} }}
			>
				<RepoSummaryChips sessions={sessions} />
			</SessionLaunchContext.Provider>
		</RepoSelectionContext.Provider>,
	);
	return { ...utils, launchAssist, setSelectedCwd };
}

afterEach(() => {
	cleanup();
	summaries = [];
});

describe("RepoSummaryChips clone-on-select", () => {
	it("makes a no-cwd non-local chip clickable and prompts to clone", () => {
		summaries = [
			{
				origin: "github.com/org/repo",
				displayName: "org/repo",
				openCount: 3,
				isCurrent: false,
				cloneTarget: "/home/user/git/repo",
			},
		];
		renderChips([]);

		fireEvent.click(screen.getByRole("button", { name: "org/repo (3)" }));

		expect(
			screen.getByText("Clone org/repo over SSH into /home/user/git/repo?"),
		).toBeTruthy();
	});

	it("launches a clone session on confirm", () => {
		summaries = [
			{
				origin: "github.com/org/repo",
				displayName: "org/repo",
				openCount: 3,
				isCurrent: false,
				cloneTarget: "/home/user/git/repo",
			},
		];
		const { launchAssist } = renderChips([]);

		fireEvent.click(screen.getByRole("button", { name: "org/repo (3)" }));
		fireEvent.click(screen.getByRole("button", { name: "Clone" }));

		expect(launchAssist).toHaveBeenCalledWith(
			["backlog", "clone", "github.com/org/repo"],
			undefined,
			{ title: "Clone org/repo", subtitle: "github.com/org/repo" },
		);
	});

	it("does not offer clone for local: origins with no cwd", () => {
		summaries = [
			{
				origin: "local:/home/user/repo",
				displayName: "repo",
				openCount: 1,
				isCurrent: false,
			},
		];
		renderChips([]);

		fireEvent.click(screen.getByText("repo (1)"));

		expect(screen.queryByRole("button", { name: "Clone" })).toBeNull();
	});

	it("selects the cloned cwd once the clone session completes", () => {
		summaries = [
			{
				origin: "github.com/org/repo",
				displayName: "org/repo",
				openCount: 3,
				isCurrent: false,
				cloneTarget: "/home/user/git/repo",
			},
		];
		const { rerender, setSelectedCwd, launchAssist } = renderChips([]);

		fireEvent.click(screen.getByRole("button", { name: "org/repo (3)" }));
		fireEvent.click(screen.getByRole("button", { name: "Clone" }));
		expect(launchAssist).toHaveBeenCalled();

		const running = session({
			id: "clone-1",
			assistArgs: ["backlog", "clone", "github.com/org/repo"],
			status: "running",
		});
		const provider = (sessions: SessionInfo[]) => (
			<RepoSelectionContext.Provider
				value={{ repos: [], selectedCwd: "", setSelectedCwd }}
			>
				<SessionLaunchContext.Provider
					value={{ launchAssist, armUpdateReload: () => {} }}
				>
					<RepoSummaryChips sessions={sessions} />
				</SessionLaunchContext.Provider>
			</RepoSelectionContext.Provider>
		);

		rerender(provider([running]));
		expect(setSelectedCwd).not.toHaveBeenCalled();

		rerender(provider([{ ...running, status: "done" }]));
		expect(setSelectedCwd).toHaveBeenCalledWith("/home/user/git/repo");
	});

	it("surfaces a clone failure and leaves the selection unchanged", () => {
		summaries = [
			{
				origin: "github.com/org/repo",
				displayName: "org/repo",
				openCount: 3,
				isCurrent: false,
				cloneTarget: "/home/user/git/repo",
			},
		];
		const { rerender, setSelectedCwd, launchAssist } = renderChips([]);

		fireEvent.click(screen.getByRole("button", { name: "org/repo (3)" }));
		fireEvent.click(screen.getByRole("button", { name: "Clone" }));

		const provider = (sessions: SessionInfo[]) => (
			<RepoSelectionContext.Provider
				value={{ repos: [], selectedCwd: "", setSelectedCwd }}
			>
				<SessionLaunchContext.Provider
					value={{ launchAssist, armUpdateReload: () => {} }}
				>
					<RepoSummaryChips sessions={sessions} />
				</SessionLaunchContext.Provider>
			</RepoSelectionContext.Provider>
		);

		rerender(
			provider([
				session({
					id: "clone-1",
					assistArgs: ["backlog", "clone", "github.com/org/repo"],
					status: "error",
					error: "git clone failed with exit code 128.",
				}),
			]),
		);

		expect(
			screen.getByText("git clone failed with exit code 128."),
		).toBeTruthy();
		expect(setSelectedCwd).not.toHaveBeenCalled();
	});
});
