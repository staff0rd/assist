import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type ExecGitOptions = {
	maxBuffer?: number;
	allowFailure?: boolean;
};

export async function execGit(
	cwd: string,
	args: string[],
	opts: ExecGitOptions = {},
): Promise<string> {
	const { maxBuffer, allowFailure } = opts;
	const { file, argv } = /^[A-Za-z]:[\\/]/.test(cwd)
		? { file: "git.exe", argv: ["-C", cwd, ...args] }
		: { file: "git", argv: args };
	try {
		const { stdout } = await execFileAsync(file, argv, {
			encoding: "utf8",
			...(maxBuffer ? { maxBuffer } : {}),
			...(file === "git" ? { cwd } : {}),
		});
		return stdout;
	} catch (error) {
		if (
			allowFailure &&
			error &&
			typeof error === "object" &&
			"stdout" in error
		) {
			return String((error as { stdout: unknown }).stdout);
		}
		throw error;
	}
}
