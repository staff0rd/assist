// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useCallback, useState } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { resolveActiveId } from "./resolveActiveId";
import type { HistoricalSession, SessionInfo } from "./types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useAdoptRepoCard } from "./useAdoptRepoCard";
import { useRepoSelection } from "./useRepoSelection";

const clone = "/repos/live";
const group = { origin: "host/org/live", clone };
const otherClone = "/repos/other";

function session(
	id: string,
	cwd: string,
	repoGroup?: typeof group,
): SessionInfo {
	return {
		id,
		name: id,
		commandType: "claude",
		status: "running",
		startedAt: 0,
		cwd,
		...(repoGroup && { repoGroup }),
	};
}

const sessions: SessionInfo[] = [
	session("clone-card", clone, group),
	session("feature", "/repos/live/.worktrees/feature", group),
	session("fix", "/repos/live/.worktrees/fix", group),
	session("other", otherClone),
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
	{
		sessionId: "past-other",
		name: "old other",
		project: "proj",
		cwd: otherClone,
		timestamp: "2026-01-01",
	},
];

function useShell(activeByRepo: Record<string, string>) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	useActiveIdReconciler(
		sessions,
		setActiveId,
		resolveActiveId(activeByRepo, sessions),
	);
	const selectCard = useCallback((id: string) => {
		setViewingTranscriptSessionId(null);
		setActiveId(id);
	}, []);
	const selectedCardId = viewingTranscriptSessionId ?? activeId;
	const selection = useRepoSelection("", history, selectedCardId, sessions);
	useAdoptRepoCard({
		selectedCwd: selection.selectedCwd,
		selectedCardId,
		sessions,
		history,
		activeByRepo,
		onSelect: selectCard,
	});
	return {
		selection,
		selectedCardId,
		selectCard,
		viewHistoryCard: setViewingTranscriptSessionId,
	};
}

function renderShell(activeByRepo: Record<string, string>) {
	return renderHook(() => useShell(activeByRepo), { wrapper: MemoryRouter });
}

describe("useRepoSelection", () => {
	it("boots onto the daemon's most recent selection", () => {
		const { result } = renderShell({
			[clone]: "feature",
			[otherClone]: "other",
		});

		expect(result.current.selection.selectedCwd).toBe(otherClone);
		expect(result.current.selection.worktreeCwd).toBe(otherClone);
	});

	it("searches the picked repo's own card, not its clone", () => {
		const { result } = renderShell({
			[clone]: "feature",
			[otherClone]: "other",
		});

		act(() => result.current.selection.setSelectedCwd(clone));

		expect(result.current.selection.worktreeCwd).toBe(
			"/repos/live/.worktrees/feature",
		);
	});

	it("searches a clicked card's worktree", () => {
		const { result } = renderShell({ [clone]: "feature" });

		act(() => result.current.selectCard("fix"));

		expect(result.current.selection.worktreeCwd).toBe(
			"/repos/live/.worktrees/fix",
		);
	});

	it("searches the clone when the picked repo has no card of its own", () => {
		const { result } = renderShell({ [otherClone]: "other" });

		act(() => result.current.selection.setSelectedCwd(clone));

		expect(result.current.selection.selectedCwd).toBe(clone);
		expect(result.current.selection.worktreeCwd).toBe(clone);
	});

	it("searches a viewed history card's worktree", () => {
		const { result } = renderShell({ [clone]: "feature" });

		act(() => result.current.viewHistoryCard("past"));

		expect(result.current.selection.worktreeCwd).toBe(
			"/repos/live/.worktrees/old",
		);
	});

	it("follows a card clicked in a repo other than the selected one", () => {
		const { result } = renderShell({ [otherClone]: "other" });

		act(() => result.current.selectCard("fix"));

		expect(result.current.selectedCardId).toBe("fix");
		expect(result.current.selection.selectedCwd).toBe(clone);
	});

	it("settles on a clicked card when both repos remember one", () => {
		const { result } = renderShell({
			[clone]: "feature",
			[otherClone]: "other",
		});

		act(() => result.current.selectCard("fix"));

		expect(result.current.selectedCardId).toBe("fix");
		expect(result.current.selection.selectedCwd).toBe(clone);
	});

	it("searches the clone for a card that runs in it", () => {
		const { result } = renderShell({ [clone]: "feature" });

		act(() => result.current.selectCard("clone-card"));

		expect(result.current.selection.worktreeCwd).toBe(clone);
	});
});
