import type { ConversationEvent } from "../../shared/harnessAdapters/types";

export function sessionWrittenPaths(events: ConversationEvent[]): string[] {
	const paths = new Set<string>();
	for (const event of events)
		if (event.kind === "tool")
			for (const op of event.operations)
				if (op.kind === "fileWrite") paths.add(op.path);
	return [...paths];
}
