import { useEffect, useState } from "react";
import { HIGH_LEVEL_STRUCTURE_TOOLBAR_HEIGHT_VAR } from "../highLevelStructureToolbarSx";

export function useStructureToolbarOffset() {
	const [toolbar, setToolbar] = useState<HTMLDivElement | null>(null);
	const [height, setHeight] = useState(0);

	useEffect(() => {
		if (!toolbar) return;
		setHeight(toolbar.offsetHeight);
		if (typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => setHeight(toolbar.offsetHeight));
		observer.observe(toolbar);
		return () => observer.disconnect();
	}, [toolbar]);

	return {
		toolbarRef: setToolbar,
		offsetSx: { [HIGH_LEVEL_STRUCTURE_TOOLBAR_HEIGHT_VAR]: `${height}px` },
	};
}
