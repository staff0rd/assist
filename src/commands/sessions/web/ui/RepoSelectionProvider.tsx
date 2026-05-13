import { createContext, type ReactNode, useContext } from "react";
import type { HistoricalSession } from "./types";
import { useRepoSelection } from "./useRepoSelection";

type RepoSelection = {
	repos: string[];
	selectedCwd: string;
	setSelectedCwd: (cwd: string) => void;
};

const RepoSelectionContext = createContext<RepoSelection | null>(null);

export function RepoSelectionProvider({
	currentCwd,
	history,
	children,
}: {
	currentCwd: string;
	history: HistoricalSession[];
	children: ReactNode;
}) {
	const value = useRepoSelection(currentCwd, history);
	return (
		<RepoSelectionContext.Provider value={value}>
			{children}
		</RepoSelectionContext.Provider>
	);
}

export function useRepoSelectionContext(): RepoSelection {
	const ctx = useContext(RepoSelectionContext);
	if (!ctx)
		throw new Error(
			"useRepoSelectionContext must be used within a RepoSelectionProvider",
		);
	return ctx;
}
