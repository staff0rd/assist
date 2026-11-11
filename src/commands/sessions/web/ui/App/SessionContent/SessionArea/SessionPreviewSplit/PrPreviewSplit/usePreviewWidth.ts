import { useMemo, useState } from "react";
import type { PrPreview } from "../../../../../../../shared/SessionInfoBase";
import type { DiffPanelMode } from "../../../../toggleDiffPanel";

export function usePreviewWidth(rendered: PrPreview | null, stacked: boolean) {
	const [mode, setMode] = useState<DiffPanelMode>("half");
	const full = mode === "full" && rendered !== null;
	return useMemo(
		() => ({
			mode,
			full,
			stacked,
			onToggleMode: () => setMode(full ? "half" : "full"),
		}),
		[mode, full, stacked],
	);
}
