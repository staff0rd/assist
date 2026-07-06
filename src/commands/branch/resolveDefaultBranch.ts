import { execSync } from "node:child_process";

export function resolveDefaultBranch(cwd?: string): string {
	const ref = execSync("git symbolic-ref --short refs/remotes/origin/HEAD", {
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
		cwd,
	}).trim();
	const [, ...rest] = ref.split("/");
	const branch = rest.join("/");
	if (!branch) {
		throw new Error(`Could not resolve default branch from "${ref}"`);
	}
	return branch;
}
