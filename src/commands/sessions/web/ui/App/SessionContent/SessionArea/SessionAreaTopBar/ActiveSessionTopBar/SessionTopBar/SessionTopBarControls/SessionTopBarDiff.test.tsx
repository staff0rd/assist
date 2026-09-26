// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ItemStatusCounts } from "../../../../../../../../gitStatus";
import { SessionTopBarDiff } from "./SessionTopBarDiff";
import type { DiffPanel } from "../../../../../../toggleDiffPanel";
import type { SessionInfo } from "../../../../../../../types";
import {
	DiffPanelsProvider,
	useDiffPanels,
} from "../../../../../../useDiffPanels";
import { useGitStatusCounts } from "../../../../../../GitStatusCounts/useGitStatusCounts";

vi.mock("../../../../../../GitStatusCounts/useGitStatusCounts", () => ({
	useGitStatusCounts: vi.fn(),
}));

const useGitStatusCountsMock = vi.mocked(useGitStatusCounts);

afterEach(cleanup);

function PanelProbe() {
	const panel = useDiffPanels().panelFor("card-1");
	return (
		<div data-testid="panel">{panel ? JSON.stringify(panel) : "none"}</div>
	);
}

function openedPanel(): DiffPanel | null {
	const text = screen.getByTestId("panel").textContent ?? "";
	return text === "none" ? null : (JSON.parse(text) as DiffPanel);
}

const session: SessionInfo = {
	id: "card-1",
	name: "my session",
	commandType: "claude",
	status: "running",
	startedAt: 0,
	cwd: "/git/repo",
	claudeSessionId: "sess-1",
};

function renderDiff(
	counts: ItemStatusCounts | null,
	overrides: Partial<SessionInfo> = {},
): void {
	useGitStatusCountsMock.mockReturnValue(counts);
	render(
		<MemoryRouter>
			<DiffPanelsProvider sessionIds={["card-1"]} onActivateSession={() => {}}>
				<SessionTopBarDiff session={{ ...session, ...overrides }} />
				<PanelProbe />
			</DiffPanelsProvider>
		</MemoryRouter>,
	);
}

const clean: ItemStatusCounts = {
	new: [],
	modified: [],
	deleted: [],
	uncommitted: { new: [], modified: [], deleted: [] },
	hasCommits: true,
};

const cleanFeatureBranch: ItemStatusCounts = {
	...clean,
	branch: "feature/x",
	defaultBranch: "origin/main",
	onDefaultBranch: false,
};

describe("SessionTopBarDiff", () => {
	it("shows the same counts the session card shows", () => {
		renderDiff({ ...clean, new: ["a.ts"], modified: ["b.ts"] });

		expect(screen.getByRole("button", { name: "+1~1" })).toBeTruthy();
	});

	it("opens the diff panel from the counts", () => {
		renderDiff({ ...clean, new: ["a.ts"] });

		fireEvent.click(screen.getByRole("button", { name: "+1" }));

		expect(openedPanel()).toEqual({
			cwd: "/git/repo",
			claudeSessionId: "sess-1",
			scope: "all",
			mode: "half",
		});
	});

	it("offers a branch diff when a clean session is off the default branch", () => {
		renderDiff(cleanFeatureBranch);

		expect(
			screen.getByRole("button", { name: "Diff against origin/main" }),
		).toBeTruthy();
	});

	it("opens the diff against the default branch", () => {
		renderDiff(cleanFeatureBranch);

		fireEvent.click(
			screen.getByRole("button", { name: "Diff against origin/main" }),
		);

		expect(openedPanel()).toEqual({
			cwd: "/git/repo",
			claudeSessionId: "sess-1",
			scope: "branch",
			mode: "half",
		});
	});

	it("offers a branch diff with no backlog change set", () => {
		renderDiff({
			new: [],
			modified: [],
			deleted: [],
			branch: "feature/x",
			defaultBranch: "origin/main",
			onDefaultBranch: false,
		});

		expect(
			screen.getByRole("button", { name: "Diff against origin/main" }),
		).toBeTruthy();
	});

	it("offers nothing on a clean default branch", () => {
		renderDiff({
			...clean,
			branch: "main",
			defaultBranch: "origin/main",
			onDefaultBranch: true,
		});

		expect(screen.queryAllByRole("button")).toEqual([]);
	});

	it("prefers the counts over the branch diff", () => {
		renderDiff({ ...cleanFeatureBranch, new: ["a.ts"] });

		expect(screen.getByRole("button", { name: "+1" })).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "Diff against origin/main" }),
		).toBeNull();
	});

	it("offers nothing for a session with no working directory", () => {
		renderDiff(cleanFeatureBranch, { cwd: undefined });

		expect(screen.queryAllByRole("button")).toEqual([]);
	});
});
