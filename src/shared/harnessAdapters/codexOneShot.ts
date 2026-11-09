import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { buildHarnessCodexArgs } from "../buildHarnessCodexArgs";
import { codexIsolatedHookArgs } from "../codexIsolatedHookArgs";
import { envDetachedFromTrackedSession } from "../envDetachedFromTrackedSession";
import { harnesses } from "../harnesses";
import type { OneShotOptions } from "./types";

const execFileAsync = promisify(execFile);

export async function codexOneShot(
	prompt: string,
	{ timeout, effort = "low", cwd }: OneShotOptions,
): Promise<string> {
	const override = buildHarnessCodexArgs();
	const run = execFileAsync(
		harnesses.codex.command,
		[
			...codexIsolatedHookArgs,
			"exec",
			...override.args,
			"--ephemeral",
			"--skip-git-repo-check",
			"--sandbox",
			"read-only",
			"-c",
			`model_reasoning_effort="${effort}"`,
			prompt,
		],
		{
			encoding: "utf8",
			windowsHide: true,
			timeout,
			cwd: cwd ?? tmpdir(),
			env: envDetachedFromTrackedSession(override.env),
		},
	);
	run.child?.stdin?.end();
	return (await run).stdout;
}
