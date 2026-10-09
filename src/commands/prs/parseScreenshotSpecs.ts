import type { PreviewAttachment } from "../sessions/shared/PreviewAttachment";
import { parseScreenshotSpec } from "./parseScreenshotSpec";

export function parseScreenshotSpecs(
	specs: string[] | undefined,
): PreviewAttachment[] {
	try {
		return (specs ?? []).map(parseScreenshotSpec);
	} catch (error) {
		console.error(`Error: ${(error as Error).message}`);
		process.exit(1);
	}
}
