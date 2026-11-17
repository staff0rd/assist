import {
	type ClaudeInit,
	missingConnectorToolsError,
} from "./missingConnectorToolsError";
import type { parseScanStreamLine } from "./parseScanStreamLine";
import type { ConnectorRunEvent, ConnectorTool } from "./types";

type SystemEvent = NonNullable<ReturnType<typeof parseScanStreamLine>>;

export function createClaudeInitCheck(
	tools: ConnectorTool[],
	onEvent: (event: ConnectorRunEvent) => void,
) {
	let init: ClaudeInit | undefined;
	return {
		onSystem(event: SystemEvent): void {
			if (event.subtype === "init" && Array.isArray(event.tools))
				init = { tools: event.tools, mcpServers: event.mcp_servers };
			if (typeof event.model === "string")
				onEvent({ type: "model", model: event.model });
		},
		assertToolsPresent(): void {
			const missing = init && missingConnectorToolsError(tools, init);
			if (missing) throw missing;
		},
	};
}
