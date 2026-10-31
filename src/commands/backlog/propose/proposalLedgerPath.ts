import { homedir } from "node:os";
import { join } from "node:path";

export function proposalLedgerPath(sessionId: string): string {
	return join(homedir(), ".assist", "proposals", `session-${sessionId}.json`);
}
