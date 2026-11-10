import { type ReactNode, useMemo } from "react";
import type { FileData } from "react-diff-view";
import { cachedHeadSource } from "../diffGaps/cachedHeadSource";
import { headSourceContext } from "../diffGaps/headSourceContext";
import { BRANCH_DIFF_SCOPE, DEFAULT_DIFF_SCOPE } from "../diffScopeOptions";
import { useApiNode } from "../../useApiNode";
import { fetchWorkingTreeLines } from "./DiffHeadSourceProvider/fetchWorkingTreeLines";
import { useForgetChangedFiles } from "./DiffHeadSourceProvider/useForgetChangedFiles";

const WORKING_TREE_SCOPES = new Set([
	DEFAULT_DIFF_SCOPE,
	"uncommitted",
	BRANCH_DIFF_SCOPE,
]);

export function DiffHeadSourceProvider({
	cwd,
	scope,
	files,
	children,
}: {
	cwd: string;
	scope: string;
	files: FileData[];
	children: ReactNode;
}) {
	const node = useApiNode();
	const workingTree = WORKING_TREE_SCOPES.has(scope);
	const source = useMemo(
		() =>
			cwd && workingTree
				? cachedHeadSource("the working tree", (path) =>
						fetchWorkingTreeLines(cwd, path, node),
					)
				: undefined,
		[cwd, node, workingTree],
	);
	useForgetChangedFiles(source, files);
	return (
		<headSourceContext.Provider value={source}>
			{children}
		</headSourceContext.Provider>
	);
}
