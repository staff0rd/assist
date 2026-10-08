import { gitSyncOrNull } from "./git";

export function cloneHead(clone: string): string | null {
	return gitSyncOrNull(clone, ["symbolic-ref", "--short", "HEAD"]);
}
