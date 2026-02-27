import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getInstallDir(): string {
	return resolve(__dirname, "..");
}

export function isGitRepo(dir: string): boolean {
	try {
		const result = execSync("git rev-parse --show-toplevel", {
			cwd: dir,
			stdio: "pipe",
		})
			.toString()
			.trim();
		return resolve(result) === resolve(dir);
	} catch {
		return false;
	}
}
