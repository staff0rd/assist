import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function codexSandboxArgs(): string[] {
	const assistHome = join(homedir(), ".assist");
	mkdirSync(assistHome, { recursive: true });
	return [
		"-c",
		"sandbox_workspace_write.network_access=true",
		"--add-dir",
		assistHome,
	];
}
