import { join } from "node:path";

export function stepScreenshotPath(reportDir: string, step: number): string {
	return join(reportDir, `step-${String(step).padStart(2, "0")}.png`);
}
