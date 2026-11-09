import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { harnesses } from "../harnesses";
import type { OneShotOptions } from "./types";

const execFileAsync = promisify(execFile);

export async function claudeOneShot(
	prompt: string,
	{ timeout }: OneShotOptions,
): Promise<string> {
	const { stdout } = await execFileAsync(
		harnesses.claude.command,
		["-p", "--model", "haiku", prompt],
		{ encoding: "utf8", windowsHide: true, timeout },
	);
	return stdout;
}
