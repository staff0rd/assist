import { createContext, useContext } from "react";
import type { DiffPanelMode } from "../toggleDiffPanel";

type PreviewWidth = {
	mode: DiffPanelMode;
	full: boolean;
	stacked?: boolean;
	flipping?: boolean;
	onToggleMode?: () => void;
};

export const PreviewWidthContext = createContext<PreviewWidth>({
	mode: "half",
	full: false,
});

export function usePreviewWidthContext(): PreviewWidth {
	return useContext(PreviewWidthContext);
}
