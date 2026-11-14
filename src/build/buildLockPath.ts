import { join } from "node:path";

export function buildLockPath(installDir: string): string {
	return join(installDir, "dist.building");
}
