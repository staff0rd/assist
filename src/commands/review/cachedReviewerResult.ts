import { statSync } from "node:fs";
import type { ReviewerResult } from "./runStreamingChild";

export function cachedReviewerResult(
	name: string,
	outputPath: string,
): ReviewerResult | null {
	let size: number;
	try {
		size = statSync(outputPath).size;
	} catch {
		return null;
	}
	if (size === 0) return null;
	console.log(`[${name}] cached → ${outputPath} (${size} bytes)`);
	return { name, outputPath, exitCode: 0, stderr: "" };
}
