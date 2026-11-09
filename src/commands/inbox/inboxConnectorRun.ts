import { z } from "zod";
import type {
	ConnectorRunEvent,
	ConnectorRunResult,
	ConnectorTool,
	HarnessAdapter,
} from "../../shared/harnessAdapters/types";
import { inboxScanSchema } from "./inboxScanSchema";

export const INBOX_SCAN_TIMEOUT_MS = 20 * 60_000;

export async function inboxConnectorRun(
	adapter: HarnessAdapter,
	prompt: string,
	tools: ConnectorTool[],
	onEvent: (event: ConnectorRunEvent) => void,
): Promise<ConnectorRunResult> {
	try {
		return await adapter.connectorRun({
			prompt,
			schema: z.toJSONSchema(inboxScanSchema, { target: "draft-07" }),
			tools,
			timeoutMs: INBOX_SCAN_TIMEOUT_MS,
			onEvent,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Inbox scan failed: ${message}`);
	}
}
