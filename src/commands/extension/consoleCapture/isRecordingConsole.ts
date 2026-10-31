import { extensionStorage } from "../sendToAssist/extensionStorage";
import { RECORD_CONSOLE_KEY } from "./types";

export async function isRecordingConsole(): Promise<boolean> {
	const stored = await extensionStorage()
		?.get(RECORD_CONSOLE_KEY)
		.catch(() => undefined);
	return stored?.[RECORD_CONSOLE_KEY] === true;
}
