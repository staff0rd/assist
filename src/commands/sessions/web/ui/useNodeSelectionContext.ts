import { createContext, useContext } from "react";
import type { NodeSelection } from "./useNodeSelection";

export const NodeSelectionContext = createContext<NodeSelection>({
	nodes: null,
	names: [],
	visible: false,
	selected: undefined,
	select: () => {},
});

export function useNodeSelectionContext(): NodeSelection {
	return useContext(NodeSelectionContext);
}
