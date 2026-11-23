import { useApiNode } from "../../../../useApiNode";
import { useNodeSelectionContext } from "../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../useRepoSelectionContext";
import { useResolvedAutopilotStatus } from "./useResolvedAutopilotStatus";

export function useAutopilotStatus(cwd: string) {
	const node = useApiNode();
	const localNode = useNodeSelectionContext().nodes?.local;
	const { cloneOn } = useRepoSelectionContext();
	return useResolvedAutopilotStatus(cwd, node, localNode, cloneOn);
}
