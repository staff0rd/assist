import type { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { ApiNodeContext } from "../../../useApiNode";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function RouteNodeScope({
	defaultTo,
	children,
}: {
	defaultTo: "selected" | "worktree";
	children: ReactNode;
}) {
	const [searchParams] = useSearchParams();
	const { selectedNode, worktreeNode } = useRepoSelectionContext();
	const fallback = defaultTo === "worktree" ? worktreeNode : selectedNode;
	const node = searchParams.get("cwd")
		? searchParams.get("node") || undefined
		: fallback;
	return (
		<ApiNodeContext.Provider value={node}>{children}</ApiNodeContext.Provider>
	);
}
