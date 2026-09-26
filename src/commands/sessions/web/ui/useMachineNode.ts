import { useNodeSelectionContext } from "./useNodeSelectionContext";

export function useMachineNode(): string | undefined {
	const { nodes, selected } = useNodeSelectionContext();
	return selected && selected !== nodes?.local ? selected : undefined;
}
