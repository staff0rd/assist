import { randomUUID } from "node:crypto";
import { sessionBase } from "./sessionBase";
import { spawnClaude } from "./spawnClaude";
import type { Session } from "./types";

const WATCH_PROMPT = "/watch";

export function createWatcherSession(id: string, cwd: string): Session {
	const claudeSessionId = randomUUID();
	return {
		...sessionBase(id, "running"),
		name: `Session ${id}`,
		commandType: "claude",
		pty: spawnClaude({
			prompt: WATCH_PROMPT,
			cwd,
			sessionId: id,
			claudeSessionId,
			auto: true,
		}),
		cwd,
		claudeSessionId,
		initialPrompt: WATCH_PROMPT,
		auto: true,
		watcher: true,
	};
}
