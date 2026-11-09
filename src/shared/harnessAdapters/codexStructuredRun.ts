import { buildLitellmCodexArgs } from "../../commands/litellm/buildLitellmCodexArgs";
import { runCodexReviewer } from "../../commands/review/runCodexReviewer";
import type { StructuredRun } from "./types";

export function codexStructuredRun({
	name,
	stdin,
	outputPath,
	model,
	spinner,
}: StructuredRun) {
	const override = buildLitellmCodexArgs(model);
	return runCodexReviewer({
		name,
		stdin,
		outputPath,
		override,
		spinner: spinner?.(override.model),
	});
}
