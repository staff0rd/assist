import { claudeBlockEvent } from "./claudeBlockEvent";
import {
	claudeConnectorResult,
	parseClaudeResultLine,
} from "./claudeConnectorResult";
import { claudeContentBlocks, claudeToolResults } from "./claudeContentBlocks";
import { createScanUsageTracker } from "./createScanUsageTracker";
import { parseScanStreamLine } from "./parseScanStreamLine";
import type { ConnectorRunEvent, ConnectorRunResult } from "./types";

type AssistantMessage = { id?: unknown; content?: unknown; usage?: unknown };

export function createClaudeConnectorStream(
	onEvent: (event: ConnectorRunEvent) => void,
) {
	const usage = createScanUsageTracker();
	let result: ReturnType<typeof parseClaudeResultLine> | undefined;
	const emitUsage = () => onEvent({ type: "usage", usage: usage.current() });

	const onAssistant = (message: AssistantMessage) => {
		const counted = usage.addTurn(message.id, message.usage);
		for (const block of claudeContentBlocks(message.content)) {
			const event = claudeBlockEvent(block, usage.takeTurnTokens);
			if (event) onEvent(event);
		}
		if (counted) emitUsage();
	};

	return {
		onLine(line: string): void {
			const event = parseScanStreamLine(line);
			if (event?.type === "system" && typeof event.model === "string")
				onEvent({ type: "model", model: event.model });
			else if (event?.type === "assistant") onAssistant(event.message ?? {});
			else if (event?.type === "user")
				claudeToolResults(event.message?.content).forEach(onEvent);
			else if (event?.type === "result") {
				result = parseClaudeResultLine(line);
				usage.finish(event);
				emitUsage();
			}
		},
		finish: (failure: string): ConnectorRunResult =>
			claudeConnectorResult(result, failure, usage.current()),
	};
}
