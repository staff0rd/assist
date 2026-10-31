import { type FlaggedMessage, inboxScanSchema } from "./inboxScanSchema";

export function parseInboxScanOutput(stdout: string): FlaggedMessage[] {
	const result = JSON.parse(stdout) as {
		is_error?: boolean;
		result?: string;
		structured_output?: unknown;
	};
	if (result.is_error)
		throw new Error(`Inbox scan failed: ${result.result ?? "unknown error"}`);
	return inboxScanSchema.parse(result.structured_output).messages;
}
