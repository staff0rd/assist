import { join } from "node:path";

/** The directory legacy disk handovers were archived under: `.assist/handovers`. */
export function getHandoversDir(cwd: string = process.cwd()): string {
	return join(cwd, ".assist", "handovers");
}
