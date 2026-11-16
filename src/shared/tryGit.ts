import { execFileSync } from "node:child_process";

export function tryGit(...args: string[]): string | null {
	try {
		return execFileSync("git", args, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
	} catch {
		return null;
	}
}
