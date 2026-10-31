import { isRecordingConsole } from "./isRecordingConsole";
import { RECORD_CONSOLE_KEY } from "./types";

type StorageChanges = Record<string, { newValue?: unknown } | undefined>;

type ExtensionGlobal = {
	browser?: {
		storage?: {
			onChanged?: {
				addListener: (listener: (changes: StorageChanges) => void) => void;
			};
		};
	};
};

export function watchRecordConsole(
	listener: (recording: boolean) => void,
): void {
	(globalThis as ExtensionGlobal).browser?.storage?.onChanged?.addListener(
		(changes) => {
			if (RECORD_CONSOLE_KEY in changes)
				listener(changes[RECORD_CONSOLE_KEY]?.newValue === true);
		},
	);
	void isRecordingConsole().then(listener);
}
