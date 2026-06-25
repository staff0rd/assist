import { homedir } from "node:os";
import { join } from "node:path";

/** Directory holding code-comment escape-hatch pin state; denied to agent reads. */
export function getRestrictedDir(): string {
	return join(homedir(), ".assist", "restricted");
}

export function getPinStatePath(pin: string): string {
	return join(getRestrictedDir(), `code-comment-${pin}.json`);
}
