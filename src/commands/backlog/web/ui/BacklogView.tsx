import { Route, Routes } from "react-router";
import { LiveSessionsContext } from "../../../sessions/web/ui/useLiveSessionsContext";
import { useReportContentReady } from "../../../sessions/web/ui/useReportContentReady";
import type { SessionSocket } from "../../../sessions/web/ui/useSessionSocket";
import { ViewRouter } from "./components/ViewRouter";
import { useBacklogItems } from "./useBacklogItems";
import { SelectSessionContext } from "./useSelectSessionContext";

export function BacklogView({ socket }: { socket: SessionSocket }) {
	const { items, loading, error, reload } = useBacklogItems();

	useReportContentReady(!loading);

	return (
		<LiveSessionsContext.Provider value={socket.sessions}>
			<SelectSessionContext.Provider value={socket.selectSession}>
				<Routes>
					<Route
						path="/*"
						element={
							<ViewRouter
								items={items}
								loading={loading}
								error={error}
								socket={socket}
								onReload={reload}
							/>
						}
					/>
				</Routes>
			</SelectSessionContext.Provider>
		</LiveSessionsContext.Provider>
	);
}
