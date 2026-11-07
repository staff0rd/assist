// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { useCallback, useState } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { resolveActiveId } from "../../../useSessionSocket/useWsConnection/resolveActiveId";
import type { HistoricalSession, SessionInfo } from "../../../types";
import type { NodeSelection } from "../../../useNodeSelection";
import { useActiveIdReconciler } from "../../../useSessionSocket/useWsConnection/useActiveIdReconciler";
import { useAdoptRepoCard } from "./useAdoptRepoCard";
import { useRepoSelection } from "./useRepoSelection";

const singleNode: NodeSelection = {
	nodes: null,
	names: [],
	visible: false,
	selected: undefined,
	select: () => {},
};

const clone = "/repos/live";
const group = { origin: "host/org/live", clone };
const otherClone = "/repos/other";

const sessions = [
	makeSessionInfo({ id: "clone-card", cwd: clone, repoGroup: group }),
	makeSessionInfo({
		id: "feature",
		cwd: "/repos/live/.worktrees/feature",
		repoGroup: group,
	}),
	makeSessionInfo({
		id: "fix",
		cwd: "/repos/live/.worktrees/fix",
		repoGroup: group,
	}),
	makeSessionInfo({ id: "other", cwd: otherClone }),
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

function useShell(
	activeByRepo: Record<string, string>,
	cards: SessionInfo[],
	nodeSelection: NodeSelection = singleNode,
	past: HistoricalSession[] = history,
) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	useActiveIdReconciler(
		cards,
		setActiveId,
		resolveActiveId(activeByRepo, cards),
	);
	const selectCard = useCallback((id: string) => {
		setViewingTranscriptSessionId(null);
		setActiveId(id);
	}, []);
	const selectedCardId = viewingTranscriptSessionId ?? activeId;
	const selection = useRepoSelection(
		"",
		past,
		selectedCardId,
		cards,
		nodeSelection,
	);
	useAdoptRepoCard({
		selectedCwd: selection.selectedCwd,
		selectedOrigin: selection.originOf(selection.selectedCwd),
		selectedCardId,
		sessions: cards,
		history: past,
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

function renderShell(
	activeByRepo: Record<string, string>,
	cards: SessionInfo[] = sessions,
) {
	return renderHook(() => useShell(activeByRepo, cards), {
		wrapper: MemoryRouter,
	});
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

	it("keeps searching the selected card when the picked repo remembers none", () => {
		const { result } = renderShell({ [otherClone]: "other" });

		act(() => result.current.selection.setSelectedCwd(clone));

		expect(result.current.selection.selectedCwd).toBe(clone);
		expect(result.current.selection.worktreeCwd).toBe(otherClone);
	});

	it("keeps searching the selected card when the picked repo's card is gone", () => {
		const { result } = renderShell({
			[otherClone]: "other",
			[clone]: "reaped",
		});

		act(() => result.current.selection.setSelectedCwd(clone));

		expect(result.current.selection.worktreeCwd).toBe(otherClone);
	});

	it("searches the picked repo clone when no card is selected", () => {
		const { result } = renderShell({ [clone]: "feature" }, []);

		act(() => result.current.selection.setSelectedCwd(clone));

		expect(result.current.selectedCardId).toBeNull();
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

	it("never maps a linked card's clone onto the local node", () => {
		const windowsClone = String.raw`C:\git\remote`;
		const linked = makeSessionInfo({
			id: "pc-windows:1",
			cwd: windowsClone,
			node: "pc-windows",
			repoGroup: { origin: "host/org/remote", clone: windowsClone },
		});
		const { result } = renderShell({}, [...sessions, linked]);

		act(() => result.current.selectCard("pc-windows:1"));

		const { cloneOn, originOf } = result.current.selection;
		expect(cloneOn(windowsClone, undefined)).toBeUndefined();
		expect(cloneOn(windowsClone, "pc-windows")).toBe(windowsClone);
		expect(originOf(windowsClone)).toBe("host/org/remote");
	});

	describe("with the repo cloned on a linked node", () => {
		const pcClone = "/pc/live";
		const pcGroup = { origin: group.origin, clone: pcClone };
		const pcCard = makeSessionInfo({
			id: "pc:1",
			cwd: pcClone,
			node: "pc",
			repoGroup: pcGroup,
		});
		const pcHistory: HistoricalSession[] = [
			...history,
			{
				sessionId: "pc:past",
				name: "pc old",
				project: "proj",
				cwd: pcClone,
				node: "pc",
				timestamp: "2026-01-01",
				repoGroup: pcGroup,
			},
		];
		const onNode = (selected: string | undefined): NodeSelection => ({
			nodes: {
				local: "wsl",
				links: [{ name: "pc" }],
			} as NodeSelection["nodes"],
			names: ["wsl", "pc"],
			visible: true,
			selected,
			select: () => {},
		});

		it("keeps the selected session when the node selector changes", () => {
			const activeByRepo = { [clone]: "feature", [pcClone]: "pc:1" };
			const cards = [...sessions, pcCard];
			const { result, rerender } = renderHook(
				({ node }: { node: string | undefined }) =>
					useShell(activeByRepo, cards, onNode(node), pcHistory),
				{ initialProps: { node: "wsl" }, wrapper: MemoryRouter },
			);
			act(() => result.current.selectCard("feature"));

			rerender({ node: "pc" });

			expect(result.current.selection.selectedCwd).toBe(pcClone);
			expect(result.current.selectedCardId).toBe("feature");
		});
	});
});
