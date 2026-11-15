import { spawnSync } from "node:child_process";

export function phaseGit(
	args: string[],
	cwd?: string,
): { ok: boolean; out: string } {
	const result = spawnSync("git", cwd ? ["-C", cwd, ...args] : args, {
		encoding: "utf8",
	});
	return { ok: result.status === 0, out: (result.stdout ?? "").trim() };
}

export function isAncestor(ancestor: string, of: string): boolean {
	return phaseGit(["merge-base", "--is-ancestor", ancestor, of]).ok;
}
