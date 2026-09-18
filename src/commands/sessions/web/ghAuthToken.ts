import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function ghAuthToken(cwd: string | undefined): Promise<string> {
	const { stdout } = await execFileAsync("gh", ["auth", "token"], {
		cwd,
		windowsHide: true,
	});
	const token = stdout.trim();
	if (!token) throw new Error("gh auth token produced no token");
	return token;
}
