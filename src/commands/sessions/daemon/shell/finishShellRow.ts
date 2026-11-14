import type { SdkShellRow } from "../../shared/SdkShellRow";
import { daemonLog } from "../daemonLog";

export function finishShellRow(
	row: SdkShellRow,
	label: string,
	exitCode: number,
	reason: string,
): boolean {
	if (row.state !== "running") return false;
	row.state = "held";
	row.exitCode = exitCode;
	row.durationMs = Date.now() - row.startedAt;
	daemonLog(
		`${label} exited: ${reason}, ${row.durationMs}ms, output held for the next message`,
	);
	return true;
}
