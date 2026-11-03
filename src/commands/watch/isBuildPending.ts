import { existsSync } from "node:fs";
import { buildPendingPath } from "./buildPendingPath";
import { isDistBehind } from "./isDistBehind";

function markedPending(cwd?: string): boolean {
	try {
		return existsSync(buildPendingPath(cwd));
	} catch {
		return false;
	}
}

export function isBuildPending(cwd?: string): boolean {
	return markedPending(cwd) || isDistBehind(cwd);
}
