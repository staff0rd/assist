import { execSync } from "node:child_process";

export function getChangedFiles(): string[] {
	const output = execSync("git diff --name-only HEAD", {
		encoding: "utf8",
	}).trim();
	if (output === "") return [];
	return output.split("\n");
}
