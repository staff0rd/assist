import { readBuiltVersion } from "./readBuiltVersion";
import { readDistVersion } from "./readDistVersion";

export function isDistBehind(cwd?: string): boolean {
	const dist = readDistVersion(cwd);
	return dist !== undefined && dist !== readBuiltVersion(cwd);
}
