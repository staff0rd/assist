import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import { createSdkBackgroundTasks } from "./createSdkBackgroundTasks";
import { createSdkUsageObserver } from "./createSdkUsageObserver";
import { sdkContextReader } from "./sdkContextReader";
import { logSdkMessage } from "./logSdkMessage";
import { sdkActivityText } from "./sdkActivityText";
import { sdkTurnStatus } from "./sdkTurnStatus";

export async function runSdkQuery(
	messages: AsyncIterable<SDKMessage>,
	sessionId: string | undefined,
	control: SdkSessionControl,
	turn: SdkTurnTracker,
): Promise<void> {
	const label = `session ${sessionId ?? "?"}`;
	const observeUsage = createSdkUsageObserver(
		label,
		sdkContextReader(messages),
	);
	const sdkBackgroundTasks = createSdkBackgroundTasks();
	try {
		for await (const message of messages) {
			logSdkMessage(label, message);
			observeUsage(message);
			const status = sdkTurnStatus(message);
			if (status) turn.setStatus(status);
			const background = sdkBackgroundTasks(message);
			if (background) control.emit({ kind: "background", tasks: background });
			if (message.type === "assistant" && message.parent_tool_use_id === null)
				turn.setActivity(sdkActivityText(message.message.content));
		}
		daemonLog(`${label} sdk query finished`);
		control.exit(0);
	} catch (error) {
		if (control.aborted()) {
			daemonLog(`${label} sdk query stopped after kill`);
			control.exit(0);
			return;
		}
		daemonLog(
			`${label} sdk query failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	}
}
