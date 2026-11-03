import { rmSync } from "node:fs";
import { buildPendingPath } from "./buildPendingPath";

export function clearBuildPending(): void {
	try {
		rmSync(buildPendingPath(), { force: true });
	} catch {}
}
