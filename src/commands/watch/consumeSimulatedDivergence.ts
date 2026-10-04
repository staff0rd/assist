import { existsSync, rmSync } from "node:fs";
import { simulatedDivergencePath } from "./simulatedDivergencePath";

export function consumeSimulatedDivergence(cwd?: string): boolean {
	try {
		const path = simulatedDivergencePath(cwd);
		if (!existsSync(path)) return false;
		rmSync(path);
		return true;
	} catch {
		return false;
	}
}
