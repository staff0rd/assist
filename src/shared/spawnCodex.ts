import { buildHarnessCodexArgs } from "./buildHarnessCodexArgs";
import { codexSessionEnvArgs } from "./codexSessionEnvArgs";
import { harnesses } from "./harnesses";
import { neutralizeCodexSkillMentions } from "./neutralizeCodexSkillMentions";
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
			...codexSessionEnvArgs(process.env),
			"-C",
			cwd,
			"--sandbox",
			options.sandbox ?? "workspace-write",
			neutralizeCodexSkillMentions(prompt),
		],
		{ env: override.env },
	);
}
