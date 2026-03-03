import { isGhApiRead } from "../../shared/isGhApiRead";
import { findCliRead } from "../../shared/loadCliReads";

export function cliHookCheck(command: string): void {
	const trimmed = command.trim();

	const matched = findCliRead(trimmed);
	if (matched) {
		console.log(`approved - read-only CLI command: ${matched}`);
		return;
	}

	if (isGhApiRead(trimmed)) {
		console.log("approved - read-only gh api command");
		return;
	}

	console.log("not approved");
	process.exitCode = 1;
}
