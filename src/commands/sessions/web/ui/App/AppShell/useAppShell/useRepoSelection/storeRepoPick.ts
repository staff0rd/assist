import type { RepoPick } from "./resolveSelectedNode";

export const REPO_PICK_KEY = "assist.sessions.repo";

export function storeRepoPick(pick: RepoPick): void {
	try {
		localStorage.setItem(REPO_PICK_KEY, JSON.stringify(pick));
	} catch {}
}
