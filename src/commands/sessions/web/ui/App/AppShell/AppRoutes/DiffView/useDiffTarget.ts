import { useSearchParams } from "react-router";
import { DEFAULT_DIFF_SCOPE } from "../diffScopeOptions";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";

export function useDiffTarget(): {
	cwd: string;
	sessionId?: string;
	scope: string;
	setScope: (scope: string) => void;
} {
	const [searchParams, setSearchParams] = useSearchParams();
	const { selectedCwd } = useRepoSelectionContext();
	return {
		cwd: searchParams.get("cwd") || selectedCwd,
		sessionId: searchParams.get("session") ?? undefined,
		scope: searchParams.get("scope") || DEFAULT_DIFF_SCOPE,
		setScope: (scope: string) => {
			setSearchParams(
				(params) => {
					if (scope === DEFAULT_DIFF_SCOPE) params.delete("scope");
					else params.set("scope", scope);
					return params;
				},
				{ replace: true },
			);
		},
	};
}
