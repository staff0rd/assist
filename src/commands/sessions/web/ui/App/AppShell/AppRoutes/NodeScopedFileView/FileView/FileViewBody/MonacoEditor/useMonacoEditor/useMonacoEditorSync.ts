import { type RefObject, useEffect } from "react";
import {
	type MonacoEditorInstance,
	type MonacoEditorSettings,
	PLAIN_TEXT,
} from "../createMonacoEditor";
import type { MonacoApi } from "../loadMonaco";

export function useMonacoEditorSync(
	editorRef: RefObject<MonacoEditorInstance | null>,
	monaco: MonacoApi | undefined,
	settings: MonacoEditorSettings,
	theme: string,
): void {
	useEffect(() => {
		const editor = editorRef.current;
		if (editor && editor.getValue() !== settings.value)
			editor.setValue(settings.value);
	}, [editorRef, monaco, settings.value]);

	useEffect(() => {
		const model = editorRef.current?.getModel();
		if (monaco && model)
			monaco.editor.setModelLanguage(model, settings.language ?? PLAIN_TEXT);
	}, [editorRef, monaco, settings.language]);

	useEffect(() => {
		monaco?.editor.setTheme(theme);
	}, [monaco, theme]);

	useEffect(() => {
		editorRef.current?.updateOptions({ readOnly: settings.readOnly ?? false });
	}, [editorRef, monaco, settings.readOnly]);
}
