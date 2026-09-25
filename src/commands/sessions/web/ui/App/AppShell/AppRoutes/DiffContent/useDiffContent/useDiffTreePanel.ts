import { useState } from "react";
import { loadPersisted, savePersisted } from "../../../loadPersisted";

const KEY = "assist:diff-tree-hidden";

export function useDiffTreePanel(): {
	treeVisible: boolean;
	onToggleTree: () => void;
} {
	const [hidden, setHidden] = useState(
		() => loadPersisted<true>(KEY).length > 0,
	);

	return {
		treeVisible: !hidden,
		onToggleTree: () => {
			const next = !hidden;
			savePersisted(KEY, next ? [true] : []);
			setHidden(next);
		},
	};
}
