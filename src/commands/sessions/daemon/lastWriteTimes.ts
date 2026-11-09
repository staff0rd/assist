import { isAbsolute, resolve } from "node:path";
import type { ConversationEvent } from "../../../shared/harnessAdapters/types";

export type WriteTarget = { file: string; within: string };

type LastWrites = { file?: number; within?: number };

function normalise(path: string, cwd: string | undefined): string {
	const absolute = cwd && !isAbsolute(path) ? resolve(cwd, path) : path;
	return absolute.replaceAll("\\", "/");
}

function latest(current: number | undefined, at: number): number {
	return current === undefined || at > current ? at : current;
}

function writtenPaths(event: ConversationEvent): string[] {
	if (event.kind !== "tool") return [];
	return event.operations.flatMap((op) =>
		op.kind === "fileWrite" ? [op.path] : [],
	);
}

export function lastWriteTimes(
	events: ConversationEvent[],
	target: WriteTarget,
	cwd?: string,
): LastWrites {
	const result: LastWrites = {};
	for (const event of events) {
		const at = Date.parse(String(event.at));
		if (Number.isNaN(at)) continue;
		for (const path of writtenPaths(event).map((p) => normalise(p, cwd))) {
			if (path.endsWith(`/${target.file}`))
				result.file = latest(result.file, at);
			if (path.includes(`/${target.within}`))
				result.within = latest(result.within, at);
		}
	}
	return result;
}
