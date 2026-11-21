import { existsSync } from "node:fs";
import path from "node:path";

export type PackageManager = "pnpm" | "npm";

export function detectPackageManager(cwd: string): PackageManager | undefined {
	if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
	if (existsSync(path.join(cwd, "package-lock.json"))) return "npm";
	return undefined;
}
