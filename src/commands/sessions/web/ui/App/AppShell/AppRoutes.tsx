import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./AppRoutes/AppLayout";
import { countRender } from "../../renderCounters";
import { RenderRateHud } from "./AppRoutes/RenderRateHud";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionsRoute } from "./AppRoutes/SessionsRoute";
import { scaledPageRoutes } from "./AppRoutes/scaledPageRoutes";

export function AppRoutes({ socket }: { socket: SessionSocket }) {
	countRender("AppRoutes");

	return (
		<>
			<RenderRateHud />
			<Routes>
				<Route element={<AppLayout socket={socket} />}>
					<Route path="sessions" element={<SessionsRoute socket={socket} />} />
					{scaledPageRoutes(socket)}
					<Route path="*" element={<Navigate to="/sessions" replace />} />
				</Route>
			</Routes>
		</>
	);
}
