import { postRoamActivity } from "./postRoamActivity";

export async function showCodexIcon(): Promise<void> {
	await postRoamActivity("codex", "post-tool-use");
}
