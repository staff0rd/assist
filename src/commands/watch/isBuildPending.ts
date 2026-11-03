import { existsSync } from "node:fs";
import { buildPendingPath } from "./buildPendingPath";

export function isBuildPending(cwd?: string): boolean {
	try {
		return existsSync(buildPendingPath(cwd));
	} catch {
		return false;
	}
}
