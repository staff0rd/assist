import { useState } from "react";
import type { NodesSheetView } from "./PhoneNodesSheet";

export function usePhoneNodesSheet(localNode: string | undefined) {
	const [view, setView] = useState<NodesSheetView | null>(null);
	return {
		view,
		setView,
		openList: () => setView({ kind: "list" }),
		openHomeUpdate: () =>
			setView(
				localNode ? { kind: "update", name: localNode } : { kind: "list" },
			),
	};
}
