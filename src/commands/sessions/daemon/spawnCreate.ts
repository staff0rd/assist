import type { HarnessKind } from "../../../shared/harnesses";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

export function spawnCreate(
	m: SessionManager,
	d: Record<string, unknown>,
): string {
	const design = d.design === true;
	const harness = d.harness as HarnessKind | undefined;
	if (design)
		daemonLog(`create: design session (cwd=${(d.cwd as string) ?? ""})`);
	if (harness && harness !== "claude")
		daemonLog(`create: ${harness} session (cwd=${(d.cwd as string) ?? ""})`);
	return m.spawn(
		d.prompt as string | undefined,
		d.cwd as string | undefined,
		design,
		harness,
	);
}
