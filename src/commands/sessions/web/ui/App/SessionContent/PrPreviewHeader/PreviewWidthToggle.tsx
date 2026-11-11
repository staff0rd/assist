import { DiffModeToggle } from "../../DiffModeToggle";
import { usePreviewWidthContext } from "../usePreviewWidthContext";

export function PreviewWidthToggle() {
	const { mode, stacked, onToggleMode } = usePreviewWidthContext();
	if (!onToggleMode) return null;
	return (
		<DiffModeToggle
			mode={mode}
			onToggleMode={onToggleMode}
			subject="preview"
			placement={stacked ? "above" : "beside"}
		/>
	);
}
