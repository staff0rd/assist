import { useEffect, useState } from "react";
import type { ViewType } from "react-diff-view";
import { loadPersisted, savePersisted } from "./loadPersisted";

const KEY = "assist:diff-view-type";

function storedViewType(): ViewType {
	const [stored] = loadPersisted<string>(KEY);
	return stored === "unified" || stored === "split" ? stored : "split";
}

export function useDiffViewType(): {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
} {
	const [viewType, setViewType] = useState<ViewType>(storedViewType);

	useEffect(() => {
		const sync = (event: StorageEvent) => {
			if (event.key === KEY) setViewType(storedViewType());
		};
		addEventListener("storage", sync);
		return () => removeEventListener("storage", sync);
	}, []);

	return {
		viewType,
		onChange: (next: ViewType) => {
			savePersisted(KEY, [next]);
			setViewType(next);
		},
	};
}
