import type { DeferredResult } from "./runDeferredCommand";

export function formatDeferredResult(
	command: string,
	{ output, exitCode }: DeferredResult,
): string {
	return `\`assist ${command}\` finished with exit code ${exitCode}:\n\n${output.trim()}`;
}
