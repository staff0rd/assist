import { useEffect } from "react";
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
	const inSelectedRepo = Boolean(
		selected && repoGroupCwd(selected) === selectedCwd,
	);
	const candidate = cardForRepo(activeByRepo, selectedCwd, sessions);
	useEffect(() => {
		if (inSelectedRepo || !candidate) return;
		onSelect(candidate);
	}, [inSelectedRepo, candidate, onSelect]);
}
