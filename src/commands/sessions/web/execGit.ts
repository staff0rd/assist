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
	const unquoted = [
		"--no-optional-locks",
		"-c",
		"core.quotePath=false",
		...args,
	];
	const { file, argv } = /^[A-Za-z]:[\\/]/.test(cwd)
		? { file: "git.exe", argv: ["-C", cwd, ...unquoted] }
		: { file: "git", argv: unquoted };
	try {
		const { stdout } = await execFileAsync(file, argv, {
			encoding: "utf8",
			windowsHide: true,
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
