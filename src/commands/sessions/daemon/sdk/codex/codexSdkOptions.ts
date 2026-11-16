import type { CodexOptions, ThreadOptions } from "@openai/codex-sdk";
import { buildHarnessCodexArgs } from "../../../../../shared/buildHarnessCodexArgs";
import { codexSandboxArgs } from "../../../../../shared/codexSandboxArgs";
import { codexSessionEnvArgs } from "../../../../../shared/codexSessionEnvArgs";
import type { DrivenSessionOpts } from "../../../../../shared/harnessAdapters/types";
import { resolveCodexModel } from "../../../../../shared/resolveCodexModel";
import { codexDeveloperInstructionsArgs } from "../../codexDeveloperInstructionsArgs";
import { sessionChildEnv } from "../../sessionChildEnv";
import { codexSdkConfig } from "./codexSdkConfig";
import { codexSdkExecutable } from "./codexSdkExecutable";

export function codexSdkOptions(opts: DrivenSessionOpts): {
	codex: CodexOptions;
	thread: ThreadOptions;
} {
	const model = resolveCodexModel(opts.model);
	const override = model
		? { args: ["-m", model], env: {} }
		: buildHarnessCodexArgs();
	const config = codexSdkConfig([
		...override.args,
		...codexSessionEnvArgs({
			ASSIST_SESSION: "1",
			ASSIST_SESSION_ID: opts.sessionId,
			ASSIST_BACKLOG_ITEM_ID: process.env.ASSIST_BACKLOG_ITEM_ID,
		}),
		...codexSandboxArgs(),
		...codexDeveloperInstructionsArgs(opts.appendSystemPromptFile),
		// why: no one can answer an approval prompt in a driven session, so escalations go to Codex's automatic reviewer
		"-c",
		'approvals_reviewer="auto_review"',
	]);
	return {
		codex: {
			codexPathOverride: codexSdkExecutable(),
			configOverrides: config.configOverrides,
			env: sessionChildEnv(process.env, opts.sessionId, {
				...opts.launcherEnv,
				...override.env,
			}),
		},
		thread: {
			model: config.model,
			workingDirectory: opts.cwd,
			sandboxMode: "workspace-write",
			approvalPolicy: "on-request",
			skipGitRepoCheck: true,
			additionalDirectories: config.additionalDirectories,
		},
	};
}
