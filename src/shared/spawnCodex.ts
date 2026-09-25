import { buildHarnessCodexArgs } from "./buildHarnessCodexArgs";
import { harnesses } from "./harnesses";
import { type SpawnResult, spawnInherit } from "./spawnInherit";

export function spawnCodex(
	prompt: string,
	options: {
		cwd?: string;
		sandbox?: "workspace-write" | "read-only";
	} = {},
): SpawnResult {
	const cwd = options.cwd ?? process.cwd();
	const override = buildHarnessCodexArgs();
	return spawnInherit(
		harnesses.codex.command,
		[
			...override.args,
			"-C",
			cwd,
			"--sandbox",
			options.sandbox ?? "workspace-write",
			prompt,
		],
		{ env: override.env },
	);
}
