import { extensionStorage } from "../sendToAssist/extensionStorage";
import { clearConsoleEntries } from "./clearConsoleEntries";
import { isRecordingConsole } from "./isRecordingConsole";
import { RECORD_CONSOLE_KEY } from "./types";

export async function attachRecordConsoleToggle(
	root: ParentNode = document,
): Promise<void> {
	const checkbox = root.querySelector<HTMLInputElement>(
		"[data-record-console]",
	);
	const status = root.querySelector<HTMLElement>("[data-console-status]");
	const storage = extensionStorage();
	if (!checkbox || !status || !storage) return;
	checkbox.checked = await isRecordingConsole();
	checkbox.addEventListener("change", async () => {
		const recording = checkbox.checked;
		await storage.set({ [RECORD_CONSOLE_KEY]: recording });
		if (recording) {
			status.textContent = "Recording";
			return;
		}
		await clearConsoleEntries();
		status.textContent = "Stopped; recorded entries deleted";
	});
}
