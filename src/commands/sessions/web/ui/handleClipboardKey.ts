export type ClipboardTerm = {
	hasSelection: () => boolean;
	getSelection: () => string;
};

export type ClipboardApi = {
	writeText: (text: string) => Promise<void>;
	readText: () => Promise<string>;
};

export function handleClipboardKey(
	event: KeyboardEvent,
	term: ClipboardTerm,
	clipboard: ClipboardApi,
	paste: (text: string) => void,
): boolean {
	if (
		event.type !== "keydown" ||
		!event.ctrlKey ||
		event.shiftKey ||
		event.altKey
	) {
		return true;
	}

	const key = event.key.toLowerCase();

	if (key === "c" && term.hasSelection()) {
		void clipboard.writeText(term.getSelection());
		return false;
	}

	if (key === "v") {
		void clipboard.readText().then(paste);
		return false;
	}

	return true;
}
