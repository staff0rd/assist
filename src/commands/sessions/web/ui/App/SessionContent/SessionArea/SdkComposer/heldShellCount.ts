import type { SessionInfo } from "../../../../types";

export function heldShellCount(session: SessionInfo): number {
	return session.sdkShell?.filter((row) => row.state === "held").length ?? 0;
}
