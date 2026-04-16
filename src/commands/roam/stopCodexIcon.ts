import { postRoamActivity } from "./postRoamActivity";

export async function stopCodexIcon(): Promise<void> {
	await postRoamActivity("codex", "stop");
}
