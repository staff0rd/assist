import type { SavedFile } from "./saveFileContent";
import type { FileContentState } from "../../../fetchFileContent";

export function loadedFile(state: FileContentState): SavedFile {
	return state.status === "ready"
		? { content: state.content, mtimeMs: state.mtimeMs }
		: { content: "", mtimeMs: 0 };
}
