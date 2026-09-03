import { useEffect, useRef } from "react";
import { cardForRepo } from "./cardForRepo";
import { findActiveSession } from "./findActiveSession";
import { repoGroupCwd } from "./repoGroupKey";
import type { HistoricalSession, SessionInfo } from "./types";

export function useAdoptRepoCard({
	selectedCwd,
	selectedCardId,
	sessions,
	history,
	activeByRepo,
	onSelect,
}: {
	selectedCwd: string;
	selectedCardId: string | null;
	sessions: SessionInfo[];
	history: HistoricalSession[];
	activeByRepo: Record<string, string>;
	onSelect: (id: string) => void;
}): void {
	const selected = findActiveSession(selectedCardId, sessions, history);
	const selectedRepo = selected && repoGroupCwd(selected);
	const inSelectedRepo = Boolean(selectedRepo && selectedRepo === selectedCwd);
	const candidate = cardForRepo(activeByRepo, selectedCwd, sessions);
	const lastCardId = useRef(selectedCardId);
	useEffect(() => {
		const newCardWillMoveRepo =
			lastCardId.current !== selectedCardId && Boolean(selectedRepo);
		lastCardId.current = selectedCardId;
		if (newCardWillMoveRepo || inSelectedRepo || !candidate) return;
		onSelect(candidate);
	}, [selectedCardId, selectedRepo, inSelectedRepo, candidate, onSelect]);
}
