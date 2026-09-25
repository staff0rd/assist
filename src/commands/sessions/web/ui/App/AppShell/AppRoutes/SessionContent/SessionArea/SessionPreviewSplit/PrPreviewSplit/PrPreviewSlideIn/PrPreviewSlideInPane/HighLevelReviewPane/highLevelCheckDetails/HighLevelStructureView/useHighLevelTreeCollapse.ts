import { useState } from "react";
import {
	loadPersisted,
	prunePersisted,
	savePersisted,
} from "../../../../../../../../../../loadPersisted";

const PREFIX = "assist:high-level-tree:";

export function useHighLevelTreeCollapse(subject: string): {
	collapsed: Set<string>;
	onToggle: (path: string) => void;
} {
	const key = `${PREFIX}${subject}`;
	const [collapsed, setCollapsed] = useState(() => {
		prunePersisted(PREFIX);
		return new Set(loadPersisted<string>(key));
	});

	return {
		collapsed,
		onToggle: (path: string) => {
			const next = new Set(collapsed);
			if (!next.delete(path)) next.add(path);
			savePersisted(key, [...next]);
			setCollapsed(next);
		},
	};
}
