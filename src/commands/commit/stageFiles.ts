import { execSync } from "node:child_process";
import { shellQuote } from "../../shared/shellQuote";

export function stageFiles(files: string[]): void {
	const escaped = files.map(shellQuote).join(" ");
	execSync(`git add ${escaped}`, { stdio: "inherit" });
}
