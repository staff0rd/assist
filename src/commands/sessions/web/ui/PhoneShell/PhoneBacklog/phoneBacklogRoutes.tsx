import { Route } from "react-router";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneBacklogItemScreen } from "./PhoneBacklogItemScreen";
import { PhoneBacklogList } from "./PhoneBacklogList";
import { PhoneBacklogMarkdownScreen } from "./PhoneBacklogMarkdownScreen";

export function phoneBacklogRoutes(socket: SessionSocket) {
	return (
		<>
			<Route path="backlog" element={<PhoneBacklogList socket={socket} />} />
			<Route
				path="backlog/:itemId"
				element={<PhoneBacklogItemScreen socket={socket} />}
			/>
			<Route
				path="backlog/:itemId/description"
				element={<PhoneBacklogMarkdownScreen page="description" />}
			/>
			<Route
				path="backlog/:itemId/criteria"
				element={<PhoneBacklogMarkdownScreen page="criteria" />}
			/>
		</>
	);
}
