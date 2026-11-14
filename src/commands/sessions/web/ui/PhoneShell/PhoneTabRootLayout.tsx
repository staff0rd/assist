import { Outlet } from "react-router";
import type { SessionInfo } from "../types";
import { PhoneTabBar } from "./PhoneTabBar";
import type { PhoneTabRestore } from "./PhoneTabBar/usePhoneTabMemory";

export function PhoneTabRootLayout({
	sessions,
	restore,
}: {
	sessions: SessionInfo[];
	restore: PhoneTabRestore;
}) {
	return (
		<>
			<Outlet />
			<PhoneTabBar sessions={sessions} restore={restore} />
		</>
	);
}
