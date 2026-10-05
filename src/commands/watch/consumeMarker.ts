import { existsSync, rmSync } from "node:fs";

export function consumeMarker(path: string): boolean {
	try {
		if (!existsSync(path)) return false;
		rmSync(path);
		return true;
	} catch {
		return false;
	}
}
