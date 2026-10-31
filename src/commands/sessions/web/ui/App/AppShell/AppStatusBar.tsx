import { StatusBar } from "../../designSystem/StatusBar";
import type { SessionSocket } from "../../useSessionSocket";
import { ClientFailuresBadge } from "./AppStatusBar/ClientFailuresBadge";
import { RateLimitsIndicator } from "./AppToolbar/RateLimitsIndicator";
import { VersionBadge } from "./HamburgerMenu/MenuTriggerButton/VersionBadge";

export function AppStatusBar({ socket }: { socket: SessionSocket }) {
	return (
		<StatusBar
			start={
				<RateLimitsIndicator
					rateLimits={socket.rateLimits}
					harnessRateLimits={socket.harnessRateLimits}
				/>
			}
			end={
				<>
					<ClientFailuresBadge />
					<VersionBadge />
				</>
			}
		/>
	);
}
