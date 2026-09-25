import type { MonacoApi } from "./loadMonaco";

export type MonacoEditorInstance = ReturnType<MonacoApi["editor"]["create"]>;

export type MonacoEditorSettings = {
	value: string;
	language?: string;
	readOnly?: boolean;
	onChange?: (value: string) => void;
};

export const PLAIN_TEXT = "plaintext";

export function createMonacoEditor(
	monaco: MonacoApi,
	element: HTMLElement,
	settings: MonacoEditorSettings,
	theme: string,
): MonacoEditorInstance {
	return monaco.editor.create(element, {
		value: settings.value,
		language: settings.language ?? PLAIN_TEXT,
		readOnly: settings.readOnly ?? false,
		theme,
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 13,
		renderWhitespace: "selection",
	});
}
