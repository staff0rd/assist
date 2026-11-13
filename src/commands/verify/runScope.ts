import { run as verifyRun } from "./run";

export function runScope(scope: string | undefined, options: object): void {
	if (scope && scope !== "all") {
		console.error(`Unknown scope: "${scope}". Use "all" to run all checks.`);
		process.exit(1);
	}
	verifyRun({ ...options, all: scope === "all" });
}
