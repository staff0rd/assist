import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const BACKLOG_MARKERS = [
	join(".assist", "backlog.db"),
	join(".assist", "backlog.jsonl"),
	"assist.backlog.yml",
];

export function findBacklogUp(startDir: string): string | null {
	let current = startDir;
	while (current !== dirname(current)) {
		if (BACKLOG_MARKERS.some((marker) => existsSync(join(current, marker)))) {
			return current;
		}
		current = dirname(current);
	}
	return null;
}
