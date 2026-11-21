import { spawnSync } from "node:child_process";
import type { PackageManager } from "./detectPackageManager";

const TIMEOUT_MS = 30_000;

type AuditRun = { stdout: string } | { error: string };

export function runAudit(pm: PackageManager, cwd: string): AuditRun {
	const result = spawnSync(pm, ["audit", "--json"], {
		cwd,
		encoding: "utf8",
		timeout: TIMEOUT_MS,
		maxBuffer: 64 * 1024 * 1024,
		shell: process.platform === "win32",
	});
	if (result.error) return { error: result.error.message };
	return { stdout: result.stdout };
}
