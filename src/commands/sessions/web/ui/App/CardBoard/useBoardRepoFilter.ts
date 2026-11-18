import { useMemo, useState } from "react";
import { displayStatus } from "../../displayStatus";
import { isAwaitingUser } from "../../isAwaitingUser";
import { buildRepoChips } from "../../PhoneShell/PhoneRepoChips/buildRepoChips";
import { filterByRepo } from "../../PhoneShell/PhoneRepoChips/filterByRepo";
import type { SessionInfo } from "../../types";

const STORAGE_KEY = "assist.cards.repoFilter";

function readStored(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

function needsYou(session: SessionInfo): boolean {
	return isAwaitingUser(displayStatus(session));
}

export function useBoardRepoFilter(sessions: SessionInfo[]) {
	const [repo, setRepo] = useState(readStored);
	const chips = useMemo(
		() => buildRepoChips(sessions, repo, needsYou),
		[sessions, repo],
	);
	const shown = useMemo(() => filterByRepo(sessions, repo), [sessions, repo]);
	const selectRepo = (next: string | null) => {
		setRepo(next);
		try {
			if (next === null) localStorage.removeItem(STORAGE_KEY);
			else localStorage.setItem(STORAGE_KEY, next);
		} catch {}
	};
	return { repo, selectRepo, chips, shown };
}
