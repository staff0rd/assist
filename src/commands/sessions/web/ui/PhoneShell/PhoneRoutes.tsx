import { type Location, Navigate, Route, Routes } from "react-router";
import type { SessionSocket } from "../useSessionSocket";
import { phoneBacklogRoutes } from "./PhoneBacklog/phoneBacklogRoutes";
import type { PhoneTabRestore } from "./PhoneTabBar/usePhoneTabMemory";
import { PhoneTabRootLayout } from "./PhoneTabRootLayout";
import { phoneSessionRoutes } from "./phoneSessionRoutes";
import { usePhoneRefresh } from "./usePhoneRefresh";

export type PhoneRoutesProps = {
	socket: SessionSocket;
	keyboardOpen: boolean;
	onOpenNodes: () => void;
	onNewSession: () => void;
};

export function PhoneRoutes({
	location,
	restore,
	...props
}: PhoneRoutesProps & { location: Location; restore: PhoneTabRestore }) {
	const refresh = usePhoneRefresh(props.socket);
	return (
		<Routes location={location}>
			<Route
				element={
					<PhoneTabRootLayout
						sessions={props.socket.sessions}
						restore={restore}
					/>
				}
			>
				{phoneSessionRoutes(props, refresh)}
				{phoneBacklogRoutes(props.socket)}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}
