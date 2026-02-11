import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export function initGit(): void {
	console.log("Initializing git repository...");
	execSync("git init", { stdio: "inherit" });
	writeFileSync(".gitignore", "dist\nnode_modules\n");
}
