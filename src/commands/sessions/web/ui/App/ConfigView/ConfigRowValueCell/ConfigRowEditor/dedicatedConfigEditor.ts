import { ConfigInstallModeEditor } from "./dedicatedConfigEditor/ConfigInstallModeEditor";
import type { ConfigNodeEditorRenderer } from "../ConfigNodeEditorRenderer";

const EDITORS: Record<string, ConfigNodeEditorRenderer> = {
	"worktree.install": ConfigInstallModeEditor,
};

export function dedicatedConfigEditor(
	key: string,
): ConfigNodeEditorRenderer | undefined {
	return EDITORS[key];
}
