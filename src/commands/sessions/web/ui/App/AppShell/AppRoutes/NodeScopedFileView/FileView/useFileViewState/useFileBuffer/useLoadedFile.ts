import { useState } from "react";
import type { FileContentState } from "../../../../../../fetchFileContent";
import { loadedFile } from "./useLoadedFile/loadedFile";
import type { SavedFile } from "./saveFileContent";

export function useLoadedFile(state: FileContentState) {
	const [loaded, setLoaded] = useState(state);
	const [saved, setSaved] = useState<SavedFile>(() => loadedFile(state));
	const [value, setValue] = useState(() => loadedFile(state).content);

	if (loaded !== state) {
		const next = loadedFile(state);
		setLoaded(state);
		setSaved(next);
		setValue(next.content);
	}

	return { saved, setSaved, value, setValue };
}
