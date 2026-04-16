import { buildRunArgs, submitSession } from "./submitSession";
import type { RunConfigInfo } from "./types";

export function submitRunOrClaude(opts: {
	selectedRun: string | null;
	configs: RunConfigInfo[];
	runParams: Record<string, string>;
	prompt: string;
	cwd: string;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateRun: (name: string, args: string[], cwd?: string) => void;
}): "run" | "claude" {
	if (opts.selectedRun) {
		const config = opts.configs.find((c) => c.name === opts.selectedRun);
		opts.onCreateRun(
			opts.selectedRun,
			buildRunArgs(config, opts.runParams),
			opts.cwd,
		);
		return "run";
	}
	submitSession(opts.prompt, opts.cwd, opts.onCreate);
	return "claude";
}
