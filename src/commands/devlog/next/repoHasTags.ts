import { execFileSync } from "node:child_process";

export function repoHasTags(): boolean {
	const output = execFileSync("git", ["tag", "--list"], { encoding: "utf8" });
	return output.trim().length > 0;
}
