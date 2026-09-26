import { useCallback, useRef, useState } from "react";
import { saveFileContent } from "./useFileBuffer/saveFileContent";
import type { FileContentState } from "../../../../fetchFileContent";
import { useLoadedFile } from "./useFileBuffer/useLoadedFile";
import { useApiNode } from "../../../../../useApiNode";

type FileBuffer = {
	value: string;
	setValue: (value: string) => void;
	save: () => void;
	saving: boolean;
	dirty: boolean;
	error: string | null;
	clearError: () => void;
};

function saveFailure(error: unknown): string {
	return error instanceof Error ? error.message : "Failed to save file";
}

export function useFileBuffer(
	cwd: string | undefined,
	path: string,
	state: FileContentState,
): FileBuffer {
	const { saved, setSaved, value, setValue } = useLoadedFile(state);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const latest = useRef(value);
	const node = useApiNode();
	latest.current = value;

	const dirty = state.status === "ready" && value !== saved.content;
	const save = useCallback(() => {
		if (!cwd || !dirty || saving) return;
		setSaving(true);
		saveFileContent({
			cwd,
			node,
			path,
			content: latest.current,
			mtimeMs: saved.mtimeMs,
		})
			.then((result) => {
				setSaved(result);
				setValue(result.content);
			})
			.catch((error: unknown) => setSaveError(saveFailure(error)))
			.finally(() => setSaving(false));
	}, [cwd, node, path, dirty, saving, saved.mtimeMs, setSaved, setValue]);

	const clearError = useCallback(() => setSaveError(null), []);

	return { value, setValue, save, saving, dirty, error: saveError, clearError };
}
