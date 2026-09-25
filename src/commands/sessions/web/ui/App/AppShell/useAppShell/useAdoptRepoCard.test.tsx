// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { HistoricalSession, SessionInfo } from "../../../types";
import { useAdoptRepoCard } from "./useAdoptRepoCard";

const routerAt = (path: string) =>
	function Wrapper({ children }: { children: ReactNode }) {
		return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
	};

const clone = "/repos/live";
const group = { origin: "host/org/live", clone };

const sessions: SessionInfo[] = [
	{
		id: "worktree",
		name: "worktree",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd: "/repos/live/.worktrees/feature",
		repoGroup: group,
	},
	{
		id: "other-repo",
		name: "other",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd: "/repos/other",
	},
];

const history: HistoricalSession[] = [
	{
		sessionId: "past",
		name: "old",
		project: "proj",
		cwd: "/repos/live/.worktrees/old",
		timestamp: "2026-01-01",
		repoGroup: group,
	},
];

const activeByRepo: Record<string, string> = { [clone]: "worktree" };

function renderAdopt(
	selectedCardId: string | null,
	selectedCwd = clone,
	active: Record<string, string> = activeByRepo,
	path = "/sessions",
) {
	const onSelect = vi.fn();
	renderHook(
		() =>
			useAdoptRepoCard({
				selectedCwd,
				selectedCardId,
				sessions,
				history,
				activeByRepo: active,
				onSelect,
			}),
		{ wrapper: routerAt(path) },
	);
	return onSelect;
}

function renderCardClick(
	from: string | null,
	to: string | null,
	selectedCwd = clone,
) {
	const onSelect = vi.fn();
	const { rerender } = renderHook(
		({ selectedCardId }: { selectedCardId: string | null }) =>
			useAdoptRepoCard({
				selectedCwd,
				selectedCardId,
				sessions,
				history,
				activeByRepo,
				onSelect,
			}),
		{
			initialProps: { selectedCardId: from },
			wrapper: routerAt("/sessions"),
		},
	);
	onSelect.mockClear();
	rerender({ selectedCardId: to });
	return onSelect;
}

describe("useAdoptRepoCard", () => {
	it("adopts the picked repo's card when the selected card is in another repo", () => {
		expect(renderAdopt("other-repo")).toHaveBeenCalledWith("worktree");
	});

	it("leaves a selected card that already belongs to the picked repo", () => {
		expect(renderAdopt("worktree")).not.toHaveBeenCalled();
	});

	it("leaves a viewed history card of the picked repo alone", () => {
		expect(renderAdopt("past")).not.toHaveBeenCalled();
	});

	it("adopts when no card is selected at all", () => {
		expect(renderAdopt(null)).toHaveBeenCalledWith("worktree");
	});

	it("keeps the out-of-repo card when the picked repo has no remembered card", () => {
		expect(renderAdopt("other-repo", clone, {})).not.toHaveBeenCalled();
	});

	it("does not adopt before a repo is selected", () => {
		expect(renderAdopt("other-repo", "")).not.toHaveBeenCalled();
	});

	it("leaves a card just clicked in another repo alone", () => {
		expect(renderCardClick("worktree", "other-repo")).not.toHaveBeenCalled();
	});

	it("adopts the picked repo's card when a card is deselected", () => {
		expect(renderCardClick("other-repo", null)).toHaveBeenCalledWith(
			"worktree",
		);
	});

	describe("on a route that deselects the session", () => {
		it("does not adopt, so it cannot fight the reconciler", () => {
			expect(
				renderAdopt(null, clone, activeByRepo, "/backlog/items/a1"),
			).not.toHaveBeenCalled();
		});
	});
});
