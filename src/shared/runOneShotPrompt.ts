import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { isCodex } from "../lib/isCodex";
import { buildHarnessCodexArgs } from "./buildHarnessCodexArgs";
import { codexIsolatedHookArgs } from "./codexIsolatedHookArgs";
import type { HarnessKind } from "./harnesses";
import { loadConfig } from "./loadConfig";

const execFileAsync = promisify(execFile);

type OneShotHarness = "claude" | "codex";

export function resolveOneShotHarness(preferred?: HarnessKind): OneShotHarness {
	const kind = preferred ?? (isCodex() ? "codex" : loadConfig().harness.engine);
	return kind === "codex" ? "codex" : "claude";
}

function envDetachedFromTrackedSession(
	extra: Record<string, string>,
): NodeJS.ProcessEnv {
	const {
		ASSIST_SESSION: _session,
		ASSIST_SESSION_ID: _sessionId,
		ASSIST_ACTIVITY_ID: _activityId,
		...env
	} = process.env;
	return { ...env, ...extra };
}

function runCodex(prompt: string, timeout: number) {
	const override = buildHarnessCodexArgs();
	const run = execFileAsync(
		"codex",
		[
			...codexIsolatedHookArgs,
			"exec",
			...override.args,
			"--ephemeral",
			"--skip-git-repo-check",
			"--sandbox",
			"read-only",
			"-c",
			'model_reasoning_effort="low"',
			prompt,
		],
		{
			encoding: "utf8",
			windowsHide: true,
			timeout,
			cwd: tmpdir(),
			env: envDetachedFromTrackedSession(override.env),
		},
	);
	run.child?.stdin?.end();
	return run;
}

export async function runOneShotPrompt(
	prompt: string,
	options: { harness?: HarnessKind; timeout?: number } = {},
): Promise<string> {
	const timeout = options.timeout ?? 30_000;
	if (resolveOneShotHarness(options.harness) === "codex")
		return (await runCodex(prompt, timeout)).stdout;
	const { stdout } = await execFileAsync(
		"claude",
		["-p", "--model", "haiku", prompt],
		{ encoding: "utf8", windowsHide: true, timeout },
	);
	return stdout;
}
