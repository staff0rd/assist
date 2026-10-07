import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getCurrentBranch(
	cwd: string,
): Promise<string | undefined> {
	try {
		const { stdout } = await execFileAsync(
			"git",
			["rev-parse", "--abbrev-ref", "HEAD"],
			{ encoding: "utf8", windowsHide: true, cwd },
		);
		const branch = stdout.trim();
		return branch && branch !== "HEAD" ? branch : undefined;
	} catch {
		return undefined;
	}
}
