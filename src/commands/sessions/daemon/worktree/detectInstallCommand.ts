import { existsSync } from "node:fs";
import { join } from "node:path";

export function detectInstallCommand(dir: string): string | null {
	if (!existsSync(join(dir, "package.json"))) return null;
	if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm install";
	if (existsSync(join(dir, "yarn.lock"))) return "yarn install";
	if (existsSync(join(dir, "bun.lockb"))) return "bun install";
	return "npm install";
}
