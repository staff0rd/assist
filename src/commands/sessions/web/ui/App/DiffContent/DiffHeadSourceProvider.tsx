import { type ReactNode, useMemo } from "react";
import type { FileData } from "react-diff-view";
import type { ConversationTarget } from "../../../../shared/sessionConversationTarget";
import { cachedHeadSource } from "../diffGaps/cachedHeadSource";
import { headSourceContext } from "../diffGaps/headSourceContext";
import { BRANCH_DIFF_SCOPE, DEFAULT_DIFF_SCOPE } from "../diffScopeOptions";
import { useApiNode } from "../../useApiNode";
import { fetchFileLines } from "./DiffHeadSourceProvider/fetchFileLines";
import { useForgetChangedFiles } from "./DiffHeadSourceProvider/useForgetChangedFiles";

const WORKING_TREE_SCOPES = new Set([
	DEFAULT_DIFF_SCOPE,
	"uncommitted",
	BRANCH_DIFF_SCOPE,
]);

export function DiffHeadSourceProvider({
	cwd,
	scope,
	conversation,
	files,
	children,
}: {
	cwd: string;
	scope: string;
	conversation?: ConversationTarget;
	files: FileData[];
	children: ReactNode;
}) {
	const node = useApiNode();
	const conversationId = conversation?.conversationId;
	const harness = conversation?.harness;
	const source = useMemo(() => {
		if (!cwd || !scope) return undefined;
		if (WORKING_TREE_SCOPES.has(scope))
			return cachedHeadSource("the working tree", (path) =>
				fetchFileLines(cwd, path, node),
			);
		const revision = {
			commit: scope,
			conversation: conversationId ? { conversationId, harness } : undefined,
		};
		return cachedHeadSource(`commit ${scope.slice(0, 7)}`, (path) =>
			fetchFileLines(cwd, path, node, revision),
		);
	}, [cwd, node, scope, conversationId, harness]);
	useForgetChangedFiles(source, files);
	return (
		<headSourceContext.Provider value={source}>
			{children}
		</headSourceContext.Provider>
	);
}
