import { join } from "node:path";

export function getHandoverPath(cwd: string = process.cwd()): string {
	return join(cwd, ".assist", "HANDOVER.md");
}
