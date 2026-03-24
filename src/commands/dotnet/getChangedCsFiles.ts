import { execSync } from "node:child_process";

export function getChangedCsFiles(
	ref: string | undefined,
	base: string | undefined,
): string[] {
	let cmd: string;
	if (base) {
		cmd = `git diff --name-only ${base}...HEAD`;
	} else if (ref) {
		cmd = `git diff --name-only ${ref}~1 ${ref}`;
	} else {
		cmd = "git diff --name-only HEAD";
	}
	const output = execSync(cmd, { encoding: "utf-8" }).trim();
	if (output === "") return [];
	return output.split("\n").filter((f) => f.toLowerCase().endsWith(".cs"));
}
