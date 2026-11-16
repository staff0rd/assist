import type { ThreadEvent } from "@openai/codex-sdk";
import { daemonLog } from "../../daemonLog";
import type { DrivenTurnEvent } from "../DrivenTurnEvent";
import { codexItemActivity } from "./codexItemActivity";

export function codexEventTurnEvents(
	event: ThreadEvent,
	label: string,
): DrivenTurnEvent[] {
	switch (event.type) {
		case "item.started":
		case "item.updated":
			return [{ kind: "activity", text: codexItemActivity(event.item) }];
		case "thread.started":
			daemonLog(`${label} codex thread started: ${event.thread_id}`);
			return [];
		case "turn.failed":
			daemonLog(`${label} codex turn failed: ${event.error.message}`);
			return [];
		case "error":
			daemonLog(`${label} codex stream error: ${event.message}`);
			return [];
		default:
			return [];
	}
}
