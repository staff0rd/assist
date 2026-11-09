import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { harnesses } from "../harnesses";
import type { OneShotOptions } from "./types";

const execFileAsync = promisify(execFile);

const MODEL_FOR_EFFORT: Record<
	NonNullable<OneShotOptions["effort"]>,
	string
> = { low: "haiku", medium: "sonnet" };

export async function claudeOneShot(
	prompt: string,
	{ timeout, effort = "low", cwd }: OneShotOptions,
): Promise<string> {
	const { stdout } = await execFileAsync(
		harnesses.claude.command,
		["-p", "--model", MODEL_FOR_EFFORT[effort], prompt],
		{ encoding: "utf8", windowsHide: true, timeout, cwd },
	);
	return stdout;
}
