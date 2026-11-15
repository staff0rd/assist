import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function discardShellResult(session: Session, shellId: string): boolean {
	const row = session.sdkShell?.find((r) => r.id === shellId);
	if (row?.state !== "held") return false;
	const rest = session.sdkShell?.filter((r) => r.id !== shellId);
	session.sdkShell = rest?.length ? rest : undefined;
	daemonLog(`session ${session.id} shell ${shellId} discarded held result`);
	return true;
}
