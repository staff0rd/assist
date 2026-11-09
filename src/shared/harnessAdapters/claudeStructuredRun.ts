import { runClaudeReviewer } from "../../commands/review/runClaudeReviewer";
import type { StructuredRun } from "./types";

export function claudeStructuredRun({
	name,
	stdin,
	outputPath,
	readDir,
	model,
	spinner,
}: StructuredRun) {
	return runClaudeReviewer({
		name,
		reviewDir: readDir,
		stdin,
		outputPath,
		model,
		spinner: spinner?.(model),
	});
}
