import { execSync } from "node:child_process";

export function getChangedCsFiles(ref: string | undefined): string[] {
	const cmd = ref
		? `git diff --name-only ${ref}~1 ${ref}`
		: "git diff --name-only HEAD";
	const output = execSync(cmd, { encoding: "utf-8" }).trim();
	if (output === "") return [];
	return output.split("\n").filter((f) => f.toLowerCase().endsWith(".cs"));
}
