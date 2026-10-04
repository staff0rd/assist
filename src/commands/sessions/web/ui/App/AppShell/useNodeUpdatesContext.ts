import { createContext, useContext } from "react";
import type { NodeUpdates } from "./NodeUpdateEntry";

export const NodeUpdatesContext = createContext<NodeUpdates>({
	entries: [],
	loading: true,
	refresh: () => {},
});

export function useNodeUpdatesContext(): NodeUpdates {
	return useContext(NodeUpdatesContext);
}
