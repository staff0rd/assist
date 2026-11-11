import { Navigate, Route } from "react-router";
import { NodesView } from "./NodesView";

export function nodesRoutes(selectSession: (id: string) => void) {
	return [
		<Route
			key="nodes"
			path="nodes"
			element={<NodesView selectSession={selectSession} />}
		/>,
		<Route
			key="updates"
			path="updates"
			element={<Navigate to="/nodes" replace />}
		/>,
	];
}
