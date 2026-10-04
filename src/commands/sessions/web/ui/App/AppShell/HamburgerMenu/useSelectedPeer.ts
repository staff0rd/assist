import { useNodeSelectionContext } from "../../../useNodeSelectionContext";

export function useSelectedPeer(): string | undefined {
	const { nodes, selected } = useNodeSelectionContext();
	return nodes && selected && selected !== nodes.local ? selected : undefined;
}
