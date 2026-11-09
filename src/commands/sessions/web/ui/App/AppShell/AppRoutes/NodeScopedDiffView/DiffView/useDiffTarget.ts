import { useSearchParams } from "react-router";
import type { ConversationTarget } from "../../../../../../../shared/sessionConversationTarget";
import { DEFAULT_DIFF_SCOPE } from "../../../../diffScopeOptions";
import { useRepoSelectionContext } from "../../../../../useRepoSelectionContext";
import { conversationFromParams } from "../../../../../../../shared/conversationFromParams";

export function useDiffTarget(): {
	cwd: string;
	conversation?: ConversationTarget;
	scope: string;
	setScope: (scope: string) => void;
} {
	const [searchParams, setSearchParams] = useSearchParams();
	const { selectedCwd } = useRepoSelectionContext();
	return {
		cwd: searchParams.get("cwd") || selectedCwd,
		conversation: conversationFromParams(searchParams),
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
