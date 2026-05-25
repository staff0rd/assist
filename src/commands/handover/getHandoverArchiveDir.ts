import { join } from "node:path";

export function getHandoverArchiveDir(cwd: string = process.cwd()): string {
	return join(cwd, ".assist", "handovers", "archive");
}
