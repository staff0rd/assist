import { execFileSync } from "node:child_process";

export function stageFiles(files: string[]): void {
	execFileSync("git", ["add", ...files], { stdio: "inherit" });
}
