import { useTheme } from "@mui/material/styles";
import { type RefObject, useEffect, useRef } from "react";
import {
	createMonacoEditor,
	type MonacoEditorInstance,
	type MonacoEditorSettings,
} from "./createMonacoEditor";
import { useLoadedMonaco } from "./useMonacoEditor/useLoadedMonaco";
import { useMonacoEditorSync } from "./useMonacoEditor/useMonacoEditorSync";

type MonacoEditorStatus = "loading" | "ready" | "error";

export function useMonacoEditor(
	container: RefObject<HTMLDivElement | null>,
	settings: MonacoEditorSettings,
): MonacoEditorStatus {
	const { monaco, failed } = useLoadedMonaco();
	const editorRef = useRef<MonacoEditorInstance>(null);
	const theme = useTheme().palette.mode === "dark" ? "vs-dark" : "vs";
	const latest = useRef({ settings, theme });
	latest.current = { settings, theme };

	useEffect(() => {
		const element = container.current;
		if (!monaco || !element) return;
		const editor = createMonacoEditor(
			monaco,
			element,
			latest.current.settings,
			latest.current.theme,
		);
		editorRef.current = editor;
		const changes = editor.onDidChangeModelContent(() =>
			latest.current.settings.onChange?.(editor.getValue()),
		);
		return () => {
			editorRef.current = null;
			changes.dispose();
			editor.getModel()?.dispose();
			editor.dispose();
		};
	}, [monaco, container]);

	useMonacoEditorSync(editorRef, monaco, settings, theme);

	if (failed) return "error";
	return monaco ? "ready" : "loading";
}
