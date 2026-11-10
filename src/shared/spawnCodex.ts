import { buildHarnessCodexArgs } from "./buildHarnessCodexArgs";
import { codexIsolatedHookArgs } from "./codexIsolatedHookArgs";
import { codexSandboxNetworkArgs } from "./codexSandboxNetworkArgs";
import { codexSessionEnvArgs } from "./codexSessionEnvArgs";
import { harnesses } from "./harnesses";
import { neutralizeCodexSkillMentions } from "./neutralizeCodexSkillMentions";
import { type SpawnResult, spawnInherit } from "./spawnInherit";
import { trustCodexProject } from "./trustCodexProject";

export function spawnCodex(
	prompt: string,
	options: {
		cwd?: string;
		sandbox?: "workspace-write" | "read-only";
		resumeSessionId?: string;
		skill?: string;
	} = {},
): SpawnResult {
	const cwd = options.cwd ?? process.cwd();
	trustCodexProject(cwd);
	const text = [
		options.skill && `$${options.skill}`,
		prompt && neutralizeCodexSkillMentions(prompt),
	]
		.filter(Boolean)
		.join(" ");
	const override = buildHarnessCodexArgs();
	return spawnInherit(
		harnesses.codex.command,
		[
			...codexIsolatedHookArgs,
			...override.args,
			...codexSessionEnvArgs(process.env),
			...codexSandboxNetworkArgs,
			"-C",
			cwd,
			"--sandbox",
			options.sandbox ?? "workspace-write",
			...(options.resumeSessionId ? ["resume", options.resumeSessionId] : []),
			...(text ? [text] : []),
		],
		{ env: override.env },
	);
}
