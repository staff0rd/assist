import { existsSync } from "node:fs";

export function repoDirExists(cwd: string): boolean {
	return existsSync(cwd);
}
