import { useState } from "react";
import type { PreviewStartTarget } from "../../../../../../../../../shared/PreviewDecision";
import { useNodeSelectionContext } from "../../../../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../../../../useRepoSelectionContext";

export type StartNodeOption = { name: string; cwd: string | undefined };

export function useStartNodeChoice(cwd: string | undefined) {
	const { nodes, names, visible } = useNodeSelectionContext();
	const { selectedCwd, selectedNode, cloneOn, originOf } =
		useRepoSelectionContext();
	const [picked, setPicked] = useState<string>();
	const repoCwd = cwd && originOf(cwd) ? cwd : selectedCwd;
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
