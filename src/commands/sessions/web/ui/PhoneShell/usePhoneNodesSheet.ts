import { useState } from "react";
import type { NodesSheetView } from "./PhoneNodesSheet";

export function usePhoneNodesSheet() {
	const [view, setView] = useState<NodesSheetView | null>(null);
	return {
		view,
		setView,
		openList: () => setView({ kind: "list" }),
	};
}
