import { useState } from "react";
import type { PreviewStartTarget } from "../../../../../../../../../shared/PreviewDecision";
import { useNodeSelectionContext } from "../../../../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../../../../useRepoSelectionContext";

function sameOrigin(a: string | undefined, b: string): boolean {
	return a?.toLowerCase() === b.toLowerCase();
}

export type StartNodeOption = { name: string; cwd: string | undefined };

export function useStartNodeChoice(
	cwd: string | undefined,
	startOrigin?: string,
) {
	const { nodes, names, visible } = useNodeSelectionContext();
	const { repos, selectedCwd, selectedNode, cloneOn, originOf } =
		useRepoSelectionContext();
	const [picked, setPicked] = useState<string>();
	const sessionRepoCwd = cwd && originOf(cwd) ? cwd : selectedCwd;
	const repoCwd = startOrigin
		? repos.find((repo) => sameOrigin(originOf(repo), startOrigin))
		: sessionRepoCwd;
	const options: StartNodeOption[] = names.map((name) => ({
		name,
		cwd: repoCwd ? cloneOn(repoCwd, name) : undefined,
	}));
	const cloned = (name: string | undefined) =>
		options.find((option) => option.name === name && option.cwd);
	const choice =
		cloned(picked) ??
		cloned(selectedNode ?? nodes?.local) ??
		options.find((option) => option.cwd);
	const target: PreviewStartTarget | undefined =
		visible && choice?.cwd ? { node: choice.name, cwd: choice.cwd } : undefined;
	return { nodes, visible, options, target, pick: setPicked };
}
