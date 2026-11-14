import { formatShellBlocks } from "../../shared/formatShellBlocks";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function takeHeldShellResults(
	session: Session,
	notify?: () => void,
): string {
	const held = session.sdkShell?.filter((row) => row.state === "held") ?? [];
	if (!held.length) return "";
	const running = session.sdkShell?.filter((row) => row.state !== "held");
	session.sdkShell = running?.length ? running : undefined;
	daemonLog(
		`session ${session.id} shell results attached to message: ${held.map((row) => row.id).join(", ")}`,
	);
	notify?.();
	return formatShellBlocks(held);
}
