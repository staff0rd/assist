import { useEffect, useState } from "react";
import { expandAncestors } from "./useCollapsedDirs/expandAncestors";

export function useCollapsedDirs(activeFile: string | undefined): {
	collapsed: ReadonlySet<string>;
	onToggleDir: (path: string) => void;
} {
	const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

	useEffect(() => {
		if (activeFile) setCollapsed((prev) => expandAncestors(prev, activeFile));
	}, [activeFile]);

	return {
		collapsed,
		onToggleDir: (path: string) =>
			setCollapsed((prev) => {
				const next = new Set(prev);
				if (!next.delete(path)) next.add(path);
				return next;
			}),
	};
}
