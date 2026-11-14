import type { Query } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";

export function awaitResume(
	label: string,
	messages: Query,
	control: SdkSessionControl,
): void {
	messages.initializationResult().then(
		() => {
			daemonLog(`${label} sdk resume complete`);
			control.emit({ kind: "resumed" });
		},
		(error: unknown) =>
			daemonLog(
				`${label} sdk resume did not complete: ${error instanceof Error ? error.message : String(error)}`,
			),
	);
}
