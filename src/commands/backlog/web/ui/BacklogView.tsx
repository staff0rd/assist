import { Route, Routes } from "react-router";
import type { SessionSocket } from "../../../sessions/web/ui/useSessionSocket";
import { EmptyBacklog } from "./components/EmptyBacklog";
import { ViewRouter } from "./components/ViewRouter";
import { useBacklogItems } from "./useBacklogItems";

export function BacklogView({ socket }: { socket: SessionSocket }) {
	const { items, loading, exists, reload, initialize } = useBacklogItems();

	if (!exists) return <EmptyBacklog onInit={initialize} />;

	return (
		<Routes>
			<Route
				path="/*"
				element={
					<ViewRouter
						items={items}
						loading={loading}
						socket={socket}
						onReload={reload}
					/>
				}
			/>
		</Routes>
	);
}
