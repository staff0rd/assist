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
		!(event.ctrlKey || event.metaKey) ||
		event.shiftKey ||
		event.altKey
	) {
		return true;
	}

	const key = event.key.toLowerCase();

	if (key === "c" && term.hasSelection()) {
		event.preventDefault();
		void clipboard.writeText(term.getSelection());
		return false;
	}

	if (key === "v") {
		event.preventDefault();
		void clipboard.readText().then(paste);
		return false;
	}

	return true;
}
