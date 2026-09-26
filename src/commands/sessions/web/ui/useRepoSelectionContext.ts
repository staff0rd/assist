import { createContext, useContext } from "react";

export type RepoSelection = {
	repos: string[];
	selectedCwd: string;
	selectedNode?: string;
	worktreeCwd: string;
	worktreeNode?: string;
	setSelectedCwd: (cwd: string, node?: string) => void;
	cloneOn: (cwd: string, node: string | undefined) => string | undefined;
	originOf: (cwd: string) => string | undefined;
};

export const RepoSelectionContext = createContext<RepoSelection>({
	repos: [],
	selectedCwd: "",
	worktreeCwd: "",
	setSelectedCwd: () => {},
	cloneOn: (cwd) => cwd,
	originOf: () => undefined,
});

export function useRepoSelectionContext(): RepoSelection {
	return useContext(RepoSelectionContext);
}
