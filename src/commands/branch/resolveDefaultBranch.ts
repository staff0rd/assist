import { execFileSync } from "node:child_process";

const REMOTE_HEAD_REGEX = /^ref:\s+refs\/heads\/(\S+)\s+HEAD$/m;

export function resolveDefaultBranch(
	override?: string,
	cwd?: string,
	remote = "origin",
): string {
	if (override) return override;

	try {
		const output = execFileSync(
			"git",
			["ls-remote", "--symref", remote, "HEAD"],
			{
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"],
				cwd,
			},
		);
		const match = output.match(REMOTE_HEAD_REGEX);
		if (match) return match[1];
	} catch {}

	return "main";
}
