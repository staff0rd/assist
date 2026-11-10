import { buildHarnessCodexArgs } from "../../../shared/buildHarnessCodexArgs";
import { codexIsolatedHookArgs } from "../../../shared/codexIsolatedHookArgs";
import { codexSandboxNetworkArgs } from "../../../shared/codexSandboxNetworkArgs";
import { prepareCodexHookTrust } from "../../../shared/prepareCodexHookTrust";
import { codexSessionEnvArgs } from "../../../shared/codexSessionEnvArgs";
import { codexDeveloperInstructionsArgs } from "./codexDeveloperInstructionsArgs";
import { daemonLog } from "./daemonLog";
import { spawnPty } from "./spawnPty";
import { trustCodexProject } from "../../../shared/trustCodexProject";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
	sessionId?: string;
	appendSystemPromptFile?: string;
};

export function spawnCodex(opts: SpawnOpts = {}) {
	const trusted = trustCodexProject(opts.cwd);
	if (trusted) daemonLog(`codex: trusted ${trusted} in config.toml`);
	const untrusted = prepareCodexHookTrust();
	if (untrusted) daemonLog(`codex: ${untrusted}`);
	const override = buildHarnessCodexArgs();
	const sessionEnv = codexSessionEnvArgs({
		ASSIST_SESSION: "1",
		ASSIST_SESSION_ID: opts.sessionId,
		ASSIST_BACKLOG_ITEM_ID: process.env.ASSIST_BACKLOG_ITEM_ID,
	});
	return spawnPty(
		[
			"codex",
			...codexIsolatedHookArgs,
			...override.args,
			...sessionEnv,
			...codexSandboxNetworkArgs,
			...codexDeveloperInstructionsArgs(opts.appendSystemPromptFile),
			...codexArgs(opts),
		],
		opts.cwd,
		opts.sessionId,
		override.env,
	);
}

function codexArgs(opts: SpawnOpts): string[] {
	const prompt = opts.prompt ? [opts.prompt] : [];
	if (opts.resumeSessionId) return ["resume", opts.resumeSessionId, ...prompt];
	return prompt;
}
