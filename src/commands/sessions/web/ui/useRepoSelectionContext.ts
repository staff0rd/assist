import { createContext, useContext } from "react";

export type RepoSelection = {
	repos: string[];
	reposByNode?: Record<string, string[]>;
	selectedCwd: string;
	worktreeCwd: string;
	setSelectedCwd: (cwd: string) => void;
};

export const RepoSelectionContext = createContext<RepoSelection>({
	repos: [],
	selectedCwd: "",
	worktreeCwd: "",
	setSelectedCwd: () => {},
});

export function useRepoSelectionContext(): RepoSelection {
	return useContext(RepoSelectionContext);
}
