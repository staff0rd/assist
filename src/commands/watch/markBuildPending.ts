import { writeFileSync } from "node:fs";
import { buildPendingPath } from "./buildPendingPath";

export function markBuildPending(): void {
	try {
		writeFileSync(buildPendingPath(), "");
	} catch {}
}
