import { z } from "zod";
import { type FlaggedMessage, inboxScanSchema } from "./inboxScanSchema";

export function parseInboxScanOutput(output: unknown): FlaggedMessage[] {
	const parsed = inboxScanSchema.safeParse(output);
	if (!parsed.success)
		throw new Error(
			`Inbox scan returned malformed output: ${z.prettifyError(parsed.error)}`,
		);
	return parsed.data.messages;
}
