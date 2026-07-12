import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

export function spawnCreate(
	m: SessionManager,
	d: Record<string, unknown>,
): string {
	const design = d.design === true;
	if (design)
		daemonLog(`create: design session (cwd=${(d.cwd as string) ?? ""})`);
	return m.spawn(
		d.prompt as string | undefined,
		d.cwd as string | undefined,
		design,
	);
}
