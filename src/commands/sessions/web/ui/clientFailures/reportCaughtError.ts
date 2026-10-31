import { markReported, wasReported } from "./markReported";
import { recordPageError } from "./recordPageError";

export function reportCaughtError(error: unknown, context: string): void {
	if (wasReported(error)) return;
	markReported(error);
	const message = error instanceof Error ? error.message : String(error);
	recordPageError("caught", `${context}: ${message}`);
}
