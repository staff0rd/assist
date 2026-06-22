import { realpathSync } from "node:fs";

/**
 * Build the absolute command cron should run for `assist backup`. Cron has a
 * minimal PATH and ephemeral version-manager shims won't resolve, so we pin both
 * the node binary (process.execPath) and the real entry script behind the
 * current `assist` invocation.
 */
export function resolveAssistCommand(): string {
	const node = process.execPath;
	const script = realpathSync(process.argv[1] ?? "");
	return `${node} ${script}`;
}
