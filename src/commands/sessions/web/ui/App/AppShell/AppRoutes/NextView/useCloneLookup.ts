import { useCallback } from "react";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import type { NextCloneLookup } from "./useNextClone";

export function useCloneLookup(selfRepo: string | null): NextCloneLookup {
	const { repos, selectedCwd, originOf } = useRepoSelectionContext();
	return useCallback(
		(repo) => {
			const key = repo.toLowerCase();
			if (selfRepo?.toLowerCase() === key) return selectedCwd;
			const origin = `github.com/${key}`;
			return repos.find((cwd) => originOf(cwd)?.toLowerCase() === origin);
		},
		[repos, selectedCwd, originOf, selfRepo],
	);
}
