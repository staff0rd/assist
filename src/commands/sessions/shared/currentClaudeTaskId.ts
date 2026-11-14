import { readlinkSync } from "node:fs";

const TASK_OUTPUT = /[\\/]tasks[\\/](b[0-9a-z]+)\.output$/;

/* why: Claude Code writes a Bash call's stdout to tasks/<task id>.output, so
 * the link behind fd 1 names the task this process runs as. */
export function currentClaudeTaskId(): string | undefined {
	try {
		return readlinkSync("/proc/self/fd/1").match(TASK_OUTPUT)?.[1];
	} catch {
		return undefined;
	}
}
