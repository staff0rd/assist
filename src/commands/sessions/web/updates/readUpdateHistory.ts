import { stripAnsi } from "../../../../shared/stripAnsi";
import { watcherLogPath } from "../../daemon/worktree/watcherLogPath";
import { readLogTail } from "../../shared/readLogTail";

const HISTORY_LINES = 200;

export function readUpdateHistory(installDir: string): string[] {
	return readLogTail(watcherLogPath(installDir), HISTORY_LINES * 2)
		.flatMap((line) => line.split("\r"))
		.map((line) => stripAnsi(line).trimEnd())
		.filter((line) => line.trim().length > 0)
		.slice(-HISTORY_LINES);
}
