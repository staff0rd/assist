import { createContext, useContext } from "react";

export type RepoSelection = {
	repos: string[];
	selectedCwd: string;
	setSelectedCwd: (cwd: string) => void;
};

export const RepoSelectionContext = createContext<RepoSelection>({
	repos: [],
	selectedCwd: "",
	setSelectedCwd: () => {},
});

export function useRepoSelectionContext(): RepoSelection {
	return useContext(RepoSelectionContext);
}
